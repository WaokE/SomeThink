const Y = require("yjs");
const syncProtocol = require("y-protocols/dist/sync.cjs");
const awarenessProtocol = require("y-protocols/dist/awareness.cjs");

const encoding = require("lib0/dist/encoding.cjs");
const decoding = require("lib0/dist/decoding.cjs");
const map = require("lib0/dist/map.cjs");

// 한번만 실행 시켜주는 함수 기능들
const debounce = require("lodash.debounce");

const callbackHandler = require("./callback.js").callbackHandler;
const isCallbackSet = require("./callback.js").isCallbackSet;

const CALLBACK_DEBOUNCE_WAIT = parseInt(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000;
const CALLBACK_DEBOUNCE_MAXWAIT = parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000;

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

// 방
const rooms = new Map();
// 타이머 관리
const timers = new Map();
// 자원제거이벤트 함수
const timeoutHandles = new Map();

const IDLENGTH = 8;

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== "false" && process.env.GC !== "0";

// 저장하고 싶으면 사용
const persistenceDir = process.env.YPERSISTENCE;
/**
 * @type {{bindState: function(string,WSSharedDoc):void, writeState:function(string,WSSharedDoc):Promise<any>, provider: any}|null}
 */
// 영속성을 위한 디스크에 저장 위치 -> 원하면 써라...
let persistence = null;
if (typeof persistenceDir === "string") {
    console.info('Persisting documents to "' + persistenceDir + '"');
    // @ts-ignore
    const LeveldbPersistence = require("y-leveldb").LeveldbPersistence;
    const ldb = new LeveldbPersistence(persistenceDir);
    persistence = {
        provider: ldb,
        bindState: async (docName, ydoc) => {
            const persistedYdoc = await ldb.getYDoc(docName);
            const newUpdates = Y.encodeStateAsUpdate(ydoc);
            ldb.storeUpdate(docName, newUpdates);
            Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
            ydoc.on("update", (update) => {
                ldb.storeUpdate(docName, update);
            });
        },
        writeState: async (docName, ydoc) => {},
    };
}

/**
 * @param {{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>,provider:any}|null} persistence_
 */
exports.setPersistence = (persistence_) => {
    persistence = persistence_;
};

/**
 * @return {null|{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>}|null} used persistence layer
 */
exports.getPersistence = () => persistence;

/**
 * @type {Map<string,WSSharedDoc>}
 */
const docs = new Map();
// exporting docs so that others can use it
exports.docs = docs;

const messageSync = 0;
const messageAwareness = 1;
// const messageAuth = 2

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update, origin, doc) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    doc.conns.forEach((_, conn) => send(doc, conn, message));
};
/** Symbol 아이디 부여
 * @param {int} length
 */
const generateClientId = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/** 방 객체 삭제
 * @param {Map} map
 * @param {string} roomName
 * @param {string} clientId
 */

const deletemember = (map, roomName, clientId) => {
    try {
        map.get(roomName).delete(clientId);
    } catch (err) {
        console.log(err);
    }
};

/** 방에 대한 인원 추가
 * @param {Map} map
 * @param {string} roomName
 * @param {string} data
 */
const addDataToRoom = (map, roomName, data) => {
    if (map.has(roomName)) {
        const existingData = map.get(roomName);
        existingData.add(data);
    } else {
        const newDataSet = new Set();
        newDataSet.add(data);
        map.set(roomName, newDataSet);
    }
};
/** 방에 관련된 콜백함수 실행하면서 조건에 맞게 자원 삭제
 * @param {WSSharedDoc} doc
 * @param {Map} map
 * @param {string} mapkey
 * @param {string} roomName
 */
const removeDoc = (doc, map, mapkey, roomName) => {
    if (timeoutHandles.has(roomName)) {
        clearTimeout(timeoutHandles.get(roomName));
    }
    const timeoutHandle = setTimeout(() => {
        try {
            if (map.get(roomName).size === 0 && doc.awareness.meta) {
                console.log("delete all");
                map.delete(roomName);
                if (doc.share.get(mapkey)) {
                    doc.share.get(mapkey)._map.forEach((value, key) => {
                        doc.share.get(mapkey)._map.delete(key);
                    });

                    doc.awareness.meta.clear();

                    doc.store.clients.clear();
                }
                timeoutHandles.clear(roomName);
            }
        } catch (err) {
            console.log(err);
        }
    }, removeTimeout);

    timeoutHandles.set(roomName, timeoutHandle);
};
// 공유자원 클래스
class WSSharedDoc extends Y.Doc {
    /**
     * @param {string} name
     */
    constructor(name) {
        super({ gc: gcEnabled });
        this.name = name;
        /**
         * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
         * @type {Map<Object, Set<number>>}
         */
        this.conns = new Map();
        /**
         * @type {awarenessProtocol.Awareness}
         */
        this.awareness = new awarenessProtocol.Awareness(this);
        this.awareness.setLocalState(null);
        /** 상태가 변하면 상태자원을 관리하는곳에 변화한 상태를 알려주고 그것을 일정 청크사이즈만큼 인코딩과 디코딩하여 상태 지속적 업데이트
         * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
         * @param {Object | null} conn Origin is the connection that made the change
         */
        const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
            const changedClients = added.concat(updated, removed);
            if (conn !== null) {
                const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(conn));
                if (connControlledIDs !== undefined) {
                    added.forEach((clientID) => {
                        connControlledIDs.add(clientID);
                    });
                    removed.forEach((clientID) => {
                        connControlledIDs.delete(clientID);
                    });
                }
            }
            // broadcast awareness update
            //
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
            );
            const buff = encoding.toUint8Array(encoder);
            this.conns.forEach((_, c) => {
                send(this, c, buff);
            });
        };
        this.awareness.on("update", awarenessChangeHandler);
        this.on("update", updateHandler);
        if (isCallbackSet) {
            this.on(
                "update",
                debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
                    maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
                })
            );
        }
    }
}
/**
 * Gets a Y.Doc by name, whether in memory or on disk
 * Docs에서 방이름에 대해 바인딩하고 지속적으로 공유할 자원으로서 기록한다.
 * @param {string} docname - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
const getYDoc = (docname, gc = true) =>
    map.setIfUndefined(docs, docname, () => {
        const doc = new WSSharedDoc(docname);
        doc.gc = gc;
        if (persistence !== null) {
            persistence.bindState(docname, doc);
        }
        docs.set(docname, doc);
        return doc;
    });

exports.getYDoc = getYDoc;

/** 프로토콜을 이용해 동기화를 잡는다. 메시지를 쏘고 encoding과 decoding을 반복하며 상태관리자원을 변화 시킨다.
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = (conn, doc, message) => {
    try {
        const encoder = encoding.createEncoder();
        const decoder = decoding.createDecoder(message);
        const messageType = decoding.readVarUint(decoder);
        switch (messageType) {
            case messageSync:
                encoding.writeVarUint(encoder, messageSync);
                syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

                // If the `encoder` only contains the type of reply message and no
                // message, there is no need to send the message. When `encoder` only
                // contains the type of reply, its length is 1.
                if (encoding.length(encoder) > 1) {
                    send(doc, conn, encoding.toUint8Array(encoder));
                }
                break;
            case messageAwareness: {
                awarenessProtocol.applyAwarenessUpdate(
                    doc.awareness,
                    decoding.readVarUint8Array(decoder),
                    conn
                );
                break;
            }
        }
    } catch (err) {
        console.error(err);
        doc.emit("error", [err]);
    }
};

/** // 해당 doc에 대한 커넥션닫기
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
const closeConn = (doc, conn) => {
    if (doc.conns.has(conn)) {
        /**
         * @type {Set<number>}
         */
        // @ts-ignore
        const controlledIds = doc.conns.get(conn);
        doc.conns.delete(conn);
        awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
        if (doc.conns.size === 0 && persistence !== null) {
            // if persisted, we store state and destroy ydocument
            persistence.writeState(doc.name, doc).then(() => {
                doc.destroy();
            });
            docs.delete(doc.name);
        }
    }
    conn.close();
};

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {Uint8Array} m
 */
const send = (doc, conn, m) => {
    if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
        closeConn(doc, conn);
    }
    try {
        conn.send(
            m,
            /** @param {any} err */ (err) => {
                err != null && closeConn(doc, conn);
            }
        );
    } catch (e) {
        closeConn(doc, conn);
    }
};

const pingTimeout = 30000;
const removeTimeout = 3000;

/**
 * @param {any} conn
 * @param {any} req
 * @param {any} opts
 */
exports.ServersetupWSConnection = (
    conn,
    req,
    { docName = req.url.slice(1).split("?")[0], gc = true } = {}
) => {
    conn.binaryType = "arraybuffer";
    // get doc, initialize if it does not exist yet
    const doc = getYDoc(docName, gc);
    doc.conns.set(conn, new Set());
    // listen and reply to events
    conn.on(
        "message",
        /** @param {ArrayBuffer} message */ (message) =>
            messageListener(conn, doc, new Uint8Array(message))
    );

    conn.clientId = generateClientId(IDLENGTH);
    addDataToRoom(rooms, docName, conn.clientId);
    console.log(`Client ${conn.clientId} connected to room ${docName}`);

    // Check if connection is still alive
    let pongReceived = true;

    // 핑퐁 알고리즘 도입
    const pingInterval = setInterval(() => {
        if (!pongReceived) {
            if (doc.conns.has(conn)) {
                closeConn(doc, conn);
            }
            clearInterval(pingInterval);
        } else if (doc.conns.has(conn)) {
            pongReceived = false;
            try {
                conn.ping();
            } catch (e) {
                closeConn(doc, conn);
                clearInterval(pingInterval);
            }
        }
    }, pingTimeout);
    conn.on("close", () => {
        console.log(`disconnected ${conn.clientId}`);
        deletemember(rooms, docName, conn.clientId);
        closeConn(doc, conn);
        clearInterval(pingInterval);
        removeDoc(doc, rooms, "MindMap", docName);
    });
    conn.on("pong", () => {
        pongReceived = true;
    });
    // scope
    {
        // send sync step 1
        // 외부에서 export될 함수이므로 따로 Sync를 맞추는 동기화 함수를 연속적으로 실행되게 해주고 상태를 관리해준다.
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, doc);
        send(doc, conn, encoding.toUint8Array(encoder));
        const awarenessStates = doc.awareness.getStates();
        if (awarenessStates.size > 0) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(
                    doc.awareness,
                    Array.from(awarenessStates.keys())
                )
            );
            send(doc, conn, encoding.toUint8Array(encoder));
        }
    }
};
/**
 * @param {any} conn
 * @param {any} req
 * @param {any} opts
 */

// 타이머에 대한 자원관리는 따로 해준다.
exports.TimersetupWSConnection = (
    conn,
    req,
    { docName = req.url.slice(1).split("?")[0], gc = true } = {}
) => {
    conn.binaryType = "arraybuffer";
    // get doc, initialize if it does not exist yet
    let doc = getYDoc(docName, gc);
    doc.conns.set(conn, new Set());
    // listen and reply to events
    conn.on(
        "message",
        /** @param {ArrayBuffer} message */ (message) =>
            messageListener(conn, doc, new Uint8Array(message))
    );
    // Check if connection is still alive
    let pongReceived = true;

    conn.clientId = generateClientId(IDLENGTH);
    addDataToRoom(timers, docName, conn.clientId);

    const pingInterval = setInterval(() => {
        if (!pongReceived) {
            if (doc.conns.has(conn)) {
                closeConn(doc, conn);
            }
            clearInterval(pingInterval);
        } else if (doc.conns.has(conn)) {
            pongReceived = false;
            try {
                conn.ping();
            } catch (e) {
                closeConn(doc, conn);
                clearInterval(pingInterval);
            }
        }
    }, pingTimeout);

    conn.on("close", () => {
        deletemember(timers, docName, conn.clientId);
        closeConn(doc, conn);
        clearInterval(pingInterval);
        removeDoc(doc, timers, "TimerData", docName);
    });
    conn.on("pong", () => {
        pongReceived = true;
    });
    // put the following in a variables in a block so the interval handlers don't keep in in
    // scope
    {
        // send sync step 1
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, doc);
        send(doc, conn, encoding.toUint8Array(encoder));
        const awarenessStates = doc.awareness.getStates();
        if (awarenessStates.size > 0) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(
                    doc.awareness,
                    Array.from(awarenessStates.keys())
                )
            );
            send(doc, conn, encoding.toUint8Array(encoder));
        }
    }
};

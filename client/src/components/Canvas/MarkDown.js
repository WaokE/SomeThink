import React, { useState, useEffect, createContext, useContext } from "react";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import IconButton from "@mui/material/IconButton";

import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem, { useTreeItem } from "@mui/lab/TreeItem";
import clsx from "clsx";

const styles = {
    markdown: {
        width: "22%",
        height: "80%",
        position: "fixed",
        right: "2vh",
        bottom: "10%",
        border: "2px solid #d9d9d9",
        overflow: "auto",
        backgroundColor: "#f8f8f8",
        borderRadius: "10px",
    },
    closeButton: {
        rotate: "180deg",
    },
    buttonContainer: {
        margin_right: "10px",
    },
};

const TreeItemContext = createContext();

const CustomContent = React.forwardRef(function CustomContent(props, ref) {
    const { nodeId, classes, className, label, icon: iconProp, expansionIcon, displayIcon } = props;

    const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        handleSelection,
        preventSelection,
    } = useTreeItem(nodeId);

    const { nodeHierarchy, handleFocusButtonClick } = useContext(TreeItemContext);

    const node = nodeHierarchy[nodeId];
    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event) => {
        preventSelection(event);
    };

    const handleExpansionClick = (event) => {
        handleExpansion(event);
    };

    const handleSelectionClick = (event) => {
        handleSelection(event);
        handleFocusButtonClick(node.x, node.y);
    };

    return (
        <div
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onMouseDown={handleMouseDown}
            ref={ref}
        >
            <div onClick={handleExpansionClick} className={classes.iconContainer}>
                {icon}
            </div>
            <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
                {label}
            </Typography>
        </div>
    );
});

function CustomTreeItem(props) {
    const { nodeId, label, nodeHierarchy, handleFocusButtonClick, ...other } = props;
    return (
        <TreeItemContext.Provider value={{ nodeHierarchy, handleFocusButtonClick }}>
            <TreeItem
                ContentComponent={CustomContent}
                ContentComponentProps={{
                    nodeId: nodeId,
                    label: label,
                }}
                nodeId={nodeId}
                label={label}
                {...other}
            />
        </TreeItemContext.Provider>
    );
}

const GraphToMarkdown = ({
    style,
    nodes,
    edges,
    isMarkdownVisible,
    setIsMarkdownVisible,
    networkRef,
    handleFocusButtonClick,
}) => {
    const [nodeHierarchy, setNodeHierarchy] = useState({});
    const [treeItems, setTreeItems] = useState([]);

    useEffect(() => {
        let newHierarchy = {};
        let markdownLinesForDisplay = [];

        edges.forEach((edge) => {
            const parent = nodes.find((node) => node.id === edge.from);
            const child = nodes.find((node) => node.id === edge.to);

            if (!parent || !child) return;

            if (!newHierarchy[parent.id]) {
                newHierarchy[parent.id] = {
                    ...parent,
                    children: [],
                };
            }

            if (!newHierarchy[child.id]) {
                newHierarchy[child.id] = {
                    ...child,
                    children: [],
                };
            }

            newHierarchy[parent.id].children.push(newHierarchy[child.id]);
        });

        function buildMarkdownStringForDisplay(node, depth = 0) {
            const markdownLine = {
                line: `${node.label}`,
                x: node.x,
                y: node.y,
                depth: depth,
            };

            markdownLinesForDisplay.push(markdownLine);

            const parentNode = newHierarchy[node.id];
            if (parentNode && parentNode.children) {
                parentNode.children.forEach((childNode, idx) => {
                    childNode.isLastChild = idx === parentNode.children.length - 1;
                    buildMarkdownStringForDisplay(childNode, depth + 1);
                });
            }
        }

        const rootNode = nodes.find((node) => node.id === 1);
        if (rootNode) {
            buildMarkdownStringForDisplay(rootNode);
        }

        setNodeHierarchy(newHierarchy);
    }, [nodes, edges]);

    const buildTreeItems = (nodeId) => {
        const node = nodeHierarchy[nodeId];
        if (!node) {
            return null;
        }
        return (
            <CustomTreeItem
                nodeId={node.id.toString()}
                label={node.label}
                key={node.id}
                nodeHierarchy={nodeHierarchy}
                handleFocusButtonClick={handleFocusButtonClick}
            >
                {node.children
                    ? node.children.map((childNode) => buildTreeItems(childNode.id))
                    : null}
            </CustomTreeItem>
        );
    };

    useEffect(() => {
        const rootNode = nodeHierarchy[1];
        if (rootNode) {
            setTreeItems(buildTreeItems(rootNode.id));
        }
    }, [nodeHierarchy, nodes, edges]);

    const makeNodeSnapshot = (node, snapShotForFile) => {
        const nodeInfo = {
            id: node.id,
            label: node.label,
            x: node.x,
            y: node.y,
            shape: node.shape,
            image: node.image,
            size: node.size,
        };
        snapShotForFile.push(nodeInfo);
    };

    const makeEdgeSnapshot = (edge, snapShotForFile) => {
        const edgeInfo = {
            from: edge.from,
            to: edge.to,
        };
        snapShotForFile.push(edgeInfo);
    };

    const handleDownloadSnapshot = () => {
        let snapshotForFile = [];

        snapshotForFile.push("nodes");
        nodes.forEach((node) => {
            makeNodeSnapshot(node, snapshotForFile);
        });

        snapshotForFile.push("edges");
        edges.forEach((edge) => {
            makeEdgeSnapshot(edge, snapshotForFile);
        });

        const snapshotString = snapshotForFile
            .map((object) => (object ? JSON.stringify(object) : ""))
            .join("\n");

        const element = document.createElement("a");
        const file = new Blob([snapshotString], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${nodes[0].label}_snapshot.txt`;
        document.body.appendChild(element);
        element.click();
    };

    const handleMarkdownVisible = () => {
        setIsMarkdownVisible(false);
    };

    useEffect(() => {
        window.addEventListener("downloadSnapshot", handleDownloadSnapshot);
        return () => {
            window.removeEventListener("downloadSnapshot", handleDownloadSnapshot);
        };
    }, []);

    return (
        <Slide direction="left" in={isMarkdownVisible} mountOnEnter unmountOnExit>
            <Box sx={{ ...styles.markdown, ...style }}>
                <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "0.5%" }}>
                    <IconButton onClick={handleMarkdownVisible}>
                        <ArrowBackRoundedIcon sx={styles.closeButton} />
                    </IconButton>
                </div>
                <TreeView
                    aria-label="icon expansion"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{ height: "fill", flexGrow: 1, maxWidth: 300 }}
                >
                    {treeItems}
                </TreeView>
            </Box>
        </Slide>
    );
};

export default GraphToMarkdown;

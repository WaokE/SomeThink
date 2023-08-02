import React, { useState, useEffect } from "react";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
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
};

const GraphToMarkdown = ({ style, nodes, edges, isMarkdownVisible, networkRef }) => {
    const [markdownForDisplay, setMarkdownForDisplay] = useState([]);
    const [markdownForFile, setMarkdownForFile] = useState([]);

    useEffect(() => {
        let nodeHierarchy = {};
        let markdownLinesForDisplay = [];
        let markdownLinesForFile = [];

        edges.forEach((edge) => {
            const parent = nodes.find((node) => node.id === edge.from);
            const child = nodes.find((node) => node.id === edge.to);

            if (!parent || !child) return;

            if (!nodeHierarchy[parent.id]) {
                nodeHierarchy[parent.id] = {
                    label: parent.label,
                    children: [child],
                };
            } else {
                nodeHierarchy[parent.id].children.push(child);
            }
        });

        function buildMarkdownStringForDisplay(node, depth = 0) {
            const space = " ".repeat((depth > 1 ? depth - 1 : 0) * 4);
            const bullet = depth === 0 ? "" : "└ ";
            const markdownLine = {
                line: `${space}${bullet}${node.label}`,
                x: node.x,
                y: node.y,
                depth: depth,
            };

            markdownLinesForDisplay.push(markdownLine);

            const parentNode = nodeHierarchy[node.id];
            if (parentNode && parentNode.children) {
                parentNode.children.forEach((childNode, idx) => {
                    childNode.isLastChild = idx === parentNode.children.length - 1;
                    buildMarkdownStringForDisplay(childNode, depth + 1);
                });
            }
        }

        function buildMarkdownStringForFile(node, depth = 0) {
            const space = " ".repeat((depth > 2 ? depth - 2 : 0) * 2);
            const bullet = "- ";
            const header = "#".repeat(depth + 1);
            const markdownLine = {
                line: `${
                    depth === 0
                        ? header + " **" + node.label + "**\n"
                        : depth === 1
                        ? "\n" + header + " " + node.label + "\n"
                        : space + bullet + node.label
                }\n`,
            };

            markdownLinesForFile.push(markdownLine);

            const parentNode = nodeHierarchy[node.id];
            if (parentNode && parentNode.children) {
                parentNode.children.forEach((childNode) =>
                    buildMarkdownStringForFile(childNode, depth + 1)
                );
            }
        }

        const rootNode = nodes.find((node) => node.id === 1);
        if (rootNode) {
            buildMarkdownStringForDisplay(rootNode);
            buildMarkdownStringForFile(rootNode);
        }

        setMarkdownForDisplay(markdownLinesForDisplay);
        setMarkdownForFile(markdownLinesForFile);
    }, [nodes, edges]);

    const handleFocusButtonClick = (x, y) => {
        networkRef.current.moveTo({
            position: { x: x, y: y },
            scale: 1.0,
            offset: { x: 0, y: 0 },
            animation: {
                duration: 500,
                easingFunction: "easeInOutQuad",
            },
        });
    };

    const handleDownload = () => {
        const markdownString = markdownForFile
            .map((lineObj) => (lineObj.line ? lineObj.line : ""))
            .join("");

        console.log("markdownString", markdownString);

        const element = document.createElement("a");
        const file = new Blob([markdownString], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${nodes[0].label}.md`;
        document.body.appendChild(element);
        element.click();
    };

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

    const displayMarkdown = () => {
        return markdownForDisplay.map((lineObj, index) => (
            <ListItem
                button
                key={index}
                onClick={() => handleFocusButtonClick(lineObj.x, lineObj.y)}
                style={{
                    whiteSpace: "pre",
                    padding: "1px",
                    minHeight: "fit-content",
                    paddingLeft: "10px",
                }}
            >
                <Typography
                    style={{
                        fontSize:
                            lineObj.depth === 0 ? "1.4em" : lineObj.depth === 1 ? "1.2em" : "1em",
                        display: "inline-block",
                        lineHeight: "1em",
                    }}
                >
                    {lineObj.line}
                </Typography>
            </ListItem>
        ));
    };

    useEffect(() => {
        // window.addEventListener("makeMarkdown", handleDownload);
        window.addEventListener("makeMarkdown", handleDownloadSnapshot);
        return () => {
            // window.removeEventListener("makeMarkdown", handleDownload);
            window.removeEventListener("makeMarkdown", handleDownloadSnapshot);
        };
    }, [markdownForFile]);

    return (
        <Slide direction="left" in={isMarkdownVisible} mountOnEnter unmountOnExit>
            <Box sx={{ ...styles.markdown, ...style }}>
                <List>{displayMarkdown()}</List>
            </Box>
        </Slide>
    );
};

export default GraphToMarkdown;

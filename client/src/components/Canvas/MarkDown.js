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
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            width: "12ch",
            "&:focus": {
                width: "20ch",
            },
        },
    },
}));

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
        marginRight: "10px",
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

    const { nodeHierarchy, handleFocusButtonClick, searchQuery } = useContext(TreeItemContext);

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

    const highlightLabel = (label) => {
        if (!searchQuery) {
            return label;
        }

        const index = label.toLowerCase().indexOf(searchQuery.toLowerCase());
        if (index !== -1) {
            return (
                <>
                    {label.substring(0, index)}
                    <span style={{ backgroundColor: "#76b5c5", color: "white" }}>
                        {label.substring(index, index + searchQuery.length)}
                    </span>
                    {label.substring(index + searchQuery.length)}
                </>
            );
        }
        return label;
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
                {highlightLabel(label)}
            </Typography>
        </div>
    );
});

function CustomTreeItem(props) {
    const { nodeId, label, nodeHierarchy, handleFocusButtonClick, searchQuery, ...other } = props;
    return (
        <TreeItemContext.Provider value={{ nodeHierarchy, handleFocusButtonClick, searchQuery }}>
            <TreeItem
                ContentComponent={CustomContent}
                ContentComponentProps={{
                    nodeId: nodeId,
                    label: label,
                }}
                nodeId={nodeId}
                label={label}
                {...other}
                sx={{
                    "& .MuiTreeItem-label": {
                        fontSize: "20px", // Set the desired font size here
                    },
                }}
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

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTreeItems, setFilteredTreeItems] = useState([]);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        let newHierarchy = {};

        const rootNode = nodes.find((node) => node.id === 1);
        if (rootNode) {
            newHierarchy[rootNode.id] = {
                ...rootNode,
                children: [],
            };
        }

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
                searchQuery={searchQuery}
            >
                {node.children
                    ? node.children.map((childNode) => buildTreeItems(childNode.id))
                    : ""}
            </CustomTreeItem>
        );
    };

    useEffect(() => {
        const rootNode = nodeHierarchy[1];
        if (rootNode) {
            setTreeItems([buildTreeItems(rootNode.id)]);
        }
    }, [nodeHierarchy, nodes, edges, searchQuery]);

    // Function to filter tree items based on the search query
    useEffect(() => {
        const filterTreeItems = (node) => {
            const includesLabel = node.label.toLowerCase().includes(searchQuery.toLowerCase());
            const includesChild = node.children.some((childNode) => filterTreeItems(childNode));
            return includesLabel || includesChild;
        };

        const filteredItems = treeItems.filter((item) =>
            filterTreeItems(item.props.nodeHierarchy[item.props.nodeId])
        );

        setFilteredTreeItems(filteredItems);
    }, [searchQuery, treeItems]);

    const makeNodeSnapshot = (node, snapShotForFile) => {
        const nodeInfo = {
            id: node.id,
            label: node.label,
            x: node.x,
            y: node.y,
            shape: node.shape,
            image: node.image,
            size: node.size,
            color: "#FBD85D",
            bookMarked: node.bookMarked,
            widthConstraint: { minimum: 50, maximum: 100 },
            heightConstraint: { minimum: 50, maximum: 100 },
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
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search..."
                            inputProps={{ "aria-label": "search" }}
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
                    </Search>
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
                    {filteredTreeItems.length > 0 ? (
                        filteredTreeItems
                    ) : (
                        <Typography sx={{ textAlign: "center" }}>
                            {" "}
                            검색 결과가 없습니다.{" "}
                        </Typography>
                    )}
                </TreeView>
            </Box>
        </Slide>
    );
};

export default GraphToMarkdown;

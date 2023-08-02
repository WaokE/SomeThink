import * as React from "react";
import { useSnackbar } from "notistack";
import Stack from "@mui/material/Stack";

export default function InformationToast(props) {
    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (props.open) {
            enqueueSnackbar(props.message, { variant: "info", autoHideDuration: 3000 });
            props.visible(false);
        }
    }, [enqueueSnackbar, props.open, props.message, props.visible]);

    return <Stack spacing={3} sx={{ width: "100%" }}></Stack>;
}

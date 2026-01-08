import { useEffect } from "react";
import api from "../services/api";

const QrGenerator = () => {
    useEffect(() => {
        api.get("/auth/profile")
            .then((res) => console.log(res.data))
            .catch((err) => console.error(err));
    }, []);

    return <h2>QR Generator</h2>;
};

export default QrGenerator;

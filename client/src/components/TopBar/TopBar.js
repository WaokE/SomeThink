import "./TopBar.css";
import { useState } from "react";

function TopBar() {
    const [animalInput, setAnimalInput] = useState("");
    const [result, setResult] = useState();

    async function onSubmit(event) {
        event.preventDefault();
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ animal: animalInput }),
            });

            const data = await response.json();
            if (response.status !== 200) {
                throw data.error || new Error(`Request failed with status ${response.status}`);
            }

            setResult(data.result);
            setAnimalInput("");
        } catch (error) {
            // Consider implementing your own error handling logic here
            console.error(error);
            alert(error.message);
        }
    }
    return (
        <div className="topbar-background">
            <div className="code">#CODE</div>
            <form onSubmit={onSubmit}>
                <input type="text" name="GPT" placeholder="Enter value" value={animalInput} onChange={(e) => setAnimalInput(e.target.value)} />
                <input type="submit" value="submit" />
            </form>
            <div>{result}</div>
            <div className="topbar-menu">
                <div className="member-info">
                    <button>Button 1</button>
                </div>
                <div className="export-btn">
                    <button>EXPORT</button>
                </div>
            </div>
        </div>
    );
}

export default TopBar;

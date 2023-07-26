const openai = require("openai");

const configuration = new openai.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openaiApi = new openai.OpenAIApi(configuration);

module.exports = async function (req, res) {
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message:
                    "OpenAI API key not configured, please follow instructions in README.md",
            },
        });
        return;
    }

    const keyword = req.body.connectedKeywords || "";
    if (keyword.trim().length === 0) {
        res.status(400).json({
            error: {
                message: "Please enter a valid keyword.",
            },
        });
        return;
    }

    try {
        const completion = await openaiApi.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(keyword, req.body.allKeywords),
            temperature: 1.0,
            max_tokens: 100, // 원하는 길이로 설정
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch (error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: "An error occurred during your request.",
                },
            });
        }
    }
};

function generatePrompt(keyword, allKeywords) {
    console.log(keyword);
    return `If I provide keywords from the sub-concepts to the higher-level concepts in mind map, 
    please analyze those keywords and recommend two more specific and closely related keywords. 
    These recommended keywords should be nouns, and even if there is no specific information about the main topic, 
    please make sure to provide only two keyword recommendations. The recommended keywords should be sub-concepts and keywords should be korean.
    If the keyword that I'm trying to recommend is in the [${allKeywords}] list, please recommend a different keyword instead.

    Question: Felidae, Mammal, Animal, Biology
    Answer: Tiger, Domestic Cat"
  
    Question: Programming Language, Software, Computer
    Answer: Java, Python"
  
    Question: ${keyword}
    Answer:`;
}

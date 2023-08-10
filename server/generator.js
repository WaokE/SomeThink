const openai = require("openai");

const configuration = new openai.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openaiApi = new openai.OpenAIApi(configuration);

/**
 * @param {any} req
 * @param {any} res
 */
module.exports = async function (req, res) {
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
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

/**
 * @param {String} keyword
 * @param {String} allKeywords
 */
const generatePrompt = (keyword, allKeywords) => {
    return `I'd like to get a recommendation for a word that is a subnode of this ${
        keyword.split(", ")[0]
    } on the mind map. 
    Please analyze the keywords provided (keywords appear in order from the lower node to the upper node) to identify the association between the keywords and present subtopics related to the upper node.
    Please present only two related keywords.
    Recommendation keywords must be nouns, and you must specify 2 keyword recommendations even if you give insufficient information.
    The recommended keyword must be Korean.
    If any of the keywords I provide are already in the [${allKeywords}] list, please suggest different keywords instead.

    Question: Food, Japan, Travel
    Answer: 스시, 소바, 돈까스, 오코노미야키, 타코야키, 돈부리, 에비동

    Question: Tourist attractions, Japan, travel
    Answer: 신주쿠(도쿄), 긴자(도쿄)
  
    Question: ${keyword}
    Answer:`;
};

const openai = require("openai");
const translate = require('google-translate-api');

const configuration = new openai.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openaiApi = new openai.OpenAIApi(configuration);

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

        const englishResult = completion.data.choices[0].text;
        console.log("영어 결과:", englishResult);

        // 영어 결과를 한글로 번역
        const koreanResult = await translate(englishResult, { to: 'ko' });
        console.log("한글 결과:", koreanResult.text);

        res.status(200).json({ result: koreanResult.text });
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
    return `I am looking to receive appropriate recommendations for the sub-concepts in a mind map. 
    Please analyze the provided keywords from the sub-concepts to the higher-level concepts and suggest two more specific and closely related keywords. 
    The recommended keywords must be nouns, and I must only need two keyword recommendations, even if there is limited information about the main topic. 
    The recommended keywords must be in English. 
    If any of the keywords I provide are already in the [${allKeywords}] list, please suggest different keywords instead.

    Question: Felidae, Mammal, Animal, Biology
    Answer: 호랑이, 고양이"
  
    Question: Programming Language, Software, Computer
    Answer: 자바, 파이썬"
  
    Question: ${keyword}
    Answer:`;
}

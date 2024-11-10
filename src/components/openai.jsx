import OpenAI from "openai";



const openai = new OpenAI({ 'apiKey': API_KEY, dangerouslyAllowBrowser: true });


export const generateOpenAICompletion = async (prompt) => {
  // console.log(readPdfFile('../../../../assets/images/Oussama_Elamraoui.pdf'))
  // content: "i want to create a costum gpts and after that use it as api fo integrate to my web site."
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt},
    { role: "system", content: "Provide information based on real things."},
    // { role: "assistant", content: 'https://www.ecenglish.com/en/101-ways-to-learn-english#:~:text=Practise%20every%20day.%20Decide%20how%20much%20time%20a,Choose%203%20or%204%20to%20practise%20each%20day'}
    ],
    model: "gpt-3.5-turbo",
  });


  return completion.choices[0].message.content || 'error';
};

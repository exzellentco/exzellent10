// Target sentences for the speech analyzer, grouped by language + level.
// Teachers can add their own (assignments) on top of these.
export const PRACTICE_SETS = [
  {
    id: "en-a1", language: "English", level: "A1",
    sentences: [
      "Hello, my name is Anna and I am learning English.",
      "I would like a cup of coffee, please.",
      "The weather is very nice today.",
      "Can you help me find the train station?",
      "I have two brothers and one sister.",
    ],
  },
  {
    id: "en-b1", language: "English", level: "B1",
    sentences: [
      "I have been studying English for three years.",
      "Could you tell me how to get to the city centre?",
      "Although it was raining, we decided to go outside.",
      "She works as a nurse in a large hospital.",
    ],
  },
  {
    id: "de-a1", language: "German", level: "A1",
    sentences: [
      "Guten Morgen, wie geht es Ihnen?",
      "Ich möchte einen Kaffee, bitte.",
      "Wo ist der Bahnhof, bitte?",
      "Ich komme aus Deutschland.",
    ],
  },
  {
    id: "de-b1", language: "German", level: "B1",
    sentences: [
      "Ich lerne seit zwei Jahren Deutsch.",
      "Können Sie mir bitte helfen?",
      "Am Wochenende besuche ich meine Familie.",
    ],
  },
];

export const langCode = (language) =>
  ({ English: "en", German: "de", Spanish: "es", French: "fr" }[language] || "en");

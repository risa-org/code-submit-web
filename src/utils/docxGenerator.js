import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

export const generateDocx = async (files, language) => {
  // Helper to process text into an array of TextRuns with preserved line breaks
  const createCodeRuns = (text) => {
    if (!text) return [new TextRun("")];
    return text.split("\n").map(
      (line, index) =>
        new TextRun({
          text: line,
          break: index > 0 ? 1 : 0, // Add line break for every line except the first
        })
    );
  };

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "CodeBlock",
          name: "Code Block",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Courier New",
            size: 20, // 10pt
          },
          paragraph: {
            spacing: { before: 100, after: 100 },
            border: {
              bottom: { color: "EFEFEF", space: 1, value: "single", size: 6 },
              top: { color: "EFEFEF", space: 1, value: "single", size: 6 },
              left: { color: "EFEFEF", space: 1, value: "single", size: 6 },
              right: { color: "EFEFEF", space: 1, value: "single", size: 6 },
            },
            shading: { fill: "f5f5f5" }, // Light gray background
          },
        },
        {
          id: "OutputBlock",
          name: "Output Block",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Consolas",
            color: "2d3748",
            size: 18, // 9pt
            bold: true,
          },
          paragraph: {
            indent: { left: 720 }, // Indent output
            shading: { fill: "e6fffa" }, // Light teal background
            border: {
              left: { color: "38B2AC", space: 4, value: "single", size: 12 }, // Accent border
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `Code Submission - ${language.toUpperCase()}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...files.flatMap((file, index) => [
            // File Name Header
            new Paragraph({
              text: `Problem ${index + 1}: ${file.name}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),

            // Source Code Label
            new Paragraph({
              text: "Source Code:",
              heading: HeadingLevel.HEADING_4,
            }),

            // Code Block (Lines preserved)
            new Paragraph({
              children: createCodeRuns(file.content),
              style: "CodeBlock",
            }),

            // Execution Output Label
            new Paragraph({
              text: "Execution Output:",
              heading: HeadingLevel.HEADING_4,
            }),

            // Output Block (Lines preserved)
            new Paragraph({
              children: createCodeRuns(file.output || "(Not executed)"),
              style: "OutputBlock",
            }),

            new Paragraph({ text: "" }), // Spacer
          ]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};

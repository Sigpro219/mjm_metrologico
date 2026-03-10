import fs from 'fs';
import JSZip from 'jszip';

async function extractTextFromWord(filePath) {
    try {
        const content = fs.readFileSync(filePath);
        const zip = await JSZip.loadAsync(content);
        const docXml = await zip.file("word/document.xml").async("string");

        const text = docXml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

        fs.writeFileSync('extracted_word.txt', text);
        console.log("Extraction complete");
    } catch (error) {
        console.error("Error extracting text:", error);
    }
}

extractTextFromWord('C:\\Users\\diana\\.gemini\\antigravity\\scratch\\mjm-web-improvement\\pagina web\\PAGINA WEB\\INFORMACIÓN PÁGINA WEB.docx');

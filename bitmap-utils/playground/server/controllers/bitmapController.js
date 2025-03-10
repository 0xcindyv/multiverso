import { DB } from "../config/db.js";

export const getBitmapReq = async (req, res) => {

    const id = req.params.id;

    if (isNaN(id) || id >= 840000 || id < 0) {
        res.send({ success: false, error: "Invalid Bitmap" })
        return;
    }

    try {
        const result = await DB.all(`
            SELECT bitmap, size, tx, pattern, (select CAST(count(b2.bitmap) AS INT) FROM bitmaps AS b2 WHERE b2.pattern = bitmaps.pattern) AS pattern_amount
            FROM bitmaps WHERE bitmap = ${id}
        `);
        
        // Processar os dados antes de enviar
        if (result.length > 0) {
            const data = result[0];
            
            // Converter strings em arrays
            try {
                // Converter tx de string para array
                if (data.tx && typeof data.tx === 'string') {
                    // Remover colchetes e converter para array de números
                    data.tx = data.tx.replace(/^\[|\]$/g, '').split(',').map(item => parseInt(item.trim()));
                }
                
                // Converter size de string para array
                if (data.size && typeof data.size === 'string') {
                    // Remover colchetes e converter para array de números
                    data.size = data.size.replace(/^\[|\]$/g, '').split(',').map(item => parseInt(item.trim()));
                }
            } catch (parseError) {
                console.error("Erro ao processar dados:", parseError);
                // Em caso de erro, manter os dados originais
            }
            
            res.send({ success: true, data });
        } else {
            res.send({ success: false, error: "Bitmap not found" });
        }
    } catch (err) {
        console.log(err.message)
        res.send({ success: false, error: "Internal server error" })
    }
}
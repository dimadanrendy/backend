import axios from "axios";

export const HandleSppt = async (req, res) => {
  const { nop } = req.params;
  const angka10 = nop.slice(0, 10);
  const tahun = new Date().getFullYear();
  // const tahun = 2025;

  console.log(nop, angka10, tahun);

  try {
    const url = `https://pbb.pangkalpinangkota.go.id/SPPT_PDF_TTE/${tahun}/${angka10}/${nop}.pdf`;
    const response = await axios.get(url, {
      responseType: "arraybuffer", // Ambil file dalam format biner
    });

    // Mengonversi array buffer menjadi string base64
    const base64String = Buffer.from(response.data, "binary").toString(
      "base64"
    );
    const pdfData = `data:application/pdf;base64,${base64String}`;

    res.status(200).json(base64String);
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ message: "File not found" });
  }
};

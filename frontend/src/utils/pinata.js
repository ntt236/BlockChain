export const uploadToIPFS = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const JWT = process.env.REACT_APP_PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYjgwNDBjZC0wODRjLTQ3YmQtYjhiYy00OGRmMzQ5NGZjNzkiLCJlbWFpbCI6InR0cjIzMDYwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTU1NWQ4MTQwODZmY2VhODVjMmUiLCJzY29wZWRLZXlTZWNyZXQiOiI1YjNhMDIxNzNkZTNhMTYwNTczYTUyNzA2YjhiZjhhZjk2Nzk2ZjczYjcxODMyY2RlMDVmMzU5YjI2YjNkZTNhIiwiZXhwIjoxODEwOTU4ODIwfQ.HDA0fZOHYTkemn_sxqE3wOtNh3W9fkTtIOaTwU-tc8I";
    if (!JWT) {
      throw new Error("Pinata JWT is not configured in .env file");
    }

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.details || errorData.error || "Failed to upload to Pinata");
    }

    const resData = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
};

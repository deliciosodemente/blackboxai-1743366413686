// Function to calculate color histogram of an image
function calculateColorHistogram(imageData) {
    const histogram = new Array(64).fill(0); // 4x4x4 color bins
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = Math.floor(data[i] / 64);     // Red channel
        const g = Math.floor(data[i+1] / 64);   // Green channel
        const b = Math.floor(data[i+2] / 64);   // Blue channel
        
        // Calculate bin index (4x4x4 color space)
        const binIndex = (r * 16) + (g * 4) + b;
        histogram[binIndex]++;
    }
    
    // Normalize histogram
    const sum = histogram.reduce((a, b) => a + b, 0);
    return histogram.map(value => value / sum);
}

// Function to calculate similarity between two histograms using cosine similarity
function calculateSimilarity(hist1, hist2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < hist1.length; i++) {
        dotProduct += hist1[i] * hist2[i];
        norm1 += hist1[i] * hist1[i];
        norm2 += hist2[i] * hist2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Function to find most similar image from a set of images
async function findMostSimilarImage(targetImage, imageSet) {
    // Create canvas to process images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load target image and get its histogram
    const targetImg = await loadImage(targetImage);
    canvas.width = targetImg.width;
    canvas.height = targetImg.height;
    ctx.drawImage(targetImg, 0, 0);
    const targetHistogram = calculateColorHistogram(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    let mostSimilarImage = null;
    let highestSimilarity = -1;
    
    // Compare with each image in the set
    for (const image of imageSet) {
        const img = await loadImage(image.src);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const histogram = calculateColorHistogram(ctx.getImageData(0, 0, canvas.width, canvas.height));
        
        const similarity = calculateSimilarity(targetHistogram, histogram);
        
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            mostSimilarImage = image;
        }
    }
    
    return {
        image: mostSimilarImage,
        similarity: highestSimilarity
    };
}

// Helper function to load image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Export functions
window.ImageSimilarity = {
    findMostSimilarImage,
    calculateSimilarity,
    calculateColorHistogram
};
const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const originalKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const resizedKey = originalKey.replace('original-images/', 'resized-images/');

    try {
        // Get the original image from S3
        const originalImage = await s3.getObject({ Bucket: bucket, Key: originalKey }).promise();

        // Resize the image using sharp
        const resizedImage = await sharp(originalImage.Body)
            .resize(300, 300) // Resize to 300x300 pixels
            .toBuffer();

        // Upload the resized image to S3
        await s3.putObject({
            Bucket: bucket,
            Key: resizedKey,
            Body: resizedImage,
            ContentType: originalImage.ContentType,
        }).promise();

        console.log(`Successfully resized and uploaded ${resizedKey}`);
        return { statusCode: 200, body: 'Image resized successfully' };
    } catch (error) {
        console.error(`Error resizing image: ${error}`);
        return { statusCode: 500, body: 'Failed to resize image' };
    }
};

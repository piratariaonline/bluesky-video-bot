import { AtpAgent } from '@atproto/api';
import { S3 } from '@aws-sdk/client-s3';
import process from 'process';
import fs from 'fs';

export const handler = async (event) => {
    console.log('Script começou.')

    const bluesky = new AtpAgent({ service: "https://bsky.social" });

    const s3 = new S3({
        region: 'sa-east-1',
        credentials: {
            accessKeyId: process.env.S3_AKID,
            secretAccessKey: process.env.S3_SAK
        }
    });

    const videoNumber = new Date().getDay() + 1;

    try {
        const videoFile = await s3.getObject({ Bucket: process.env.S3_BUCKET, Key: `${videoNumber}.mp4` });
        if (!(videoFile && videoFile.hasOwnProperty('Body')))
            console.error('Problema ao obter video') && process.exit(1);

        await bluesky.login({
            identifier: process.env.BSKY_ID,
            password: process.env.BSKY_TOKEN
        });

        const videoByteArray = await videoFile.Body.transformToByteArray();
        if (!(videoByteArray && videoByteArray.length > 0))
            console.error('Problema ao processar video') && process.exit(1);

        const response = await bluesky.uploadBlob(videoByteArray, { encoding: 'video/mp4' });
        if (!(response && response.data && response.data.hasOwnProperty('blob')))
            console.error('Problema ao carregar video') && process.exit(1);

        const videoData = response.data.blob;
        const videoInfo = JSON.parse(fs.readFileSync(new URL('./videoinfo.json', import.meta.url)));
        const videoPostText = JSON.parse(fs.readFileSync(new URL('./videoposttext.json', import.meta.url)));

        const videoPost = await bluesky.post({
            text: videoPostText.postContent,
            embed: {
                $type: 'app.bsky.embed.video',
                video: videoData,
                alt: videoInfo[videoNumber]
            }
        });
        if (!(videoPost && videoPost.hasOwnProperty('cid')))
            console.error('Problema ao postar conteúdo') && process.exit(1);

        const creditsPost = await bluesky.post({
            text: videoInfo[videoNumber],
            reply: {
                root: {
                    uri: videoPost.uri,
                    cid: videoPost.cid
                },
                parent: {
                    uri: videoPost.uri,
                    cid: videoPost.cid
                }
            }
        });
        if (creditsPost && creditsPost.hasOwnProperty('cid'))
            console.log(`${(new Date()).toISOString()}: Postado ${videoNumber}.mp4 em ${videoPost.uri}, créditos em ${creditsPost.uri}`);
        else console.error('Problema ao postar créditos do conteúdo') && process.exit(1);

    } catch (err) {
        console.error(`ERRO! ${err}`)
        process.exit(1);
    }

    console.log('Script terminou.')
    process.exit(0);
}
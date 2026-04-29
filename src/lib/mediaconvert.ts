import {
  MediaConvertClient,
  CreateJobCommand,
} from "@aws-sdk/client-mediaconvert";
import { S3_BUCKET, S3_BASE_URL } from "@/lib/s3";

export const mediaConvert = new MediaConvertClient({
  region: process.env.AWS_REGION!,
  endpoint: process.env.MEDIACONVERT_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function getProcessedKey(videoId: string) {
  return `videos/${videoId}/720p.mp4`;
}

export function getProcessedUrl(videoId: string) {
  return `${S3_BASE_URL}/${getProcessedKey(videoId)}`;
}

export async function submitTranscodeJob(videoId: string, inputKey: string) {
  const command = new CreateJobCommand({
    Role: process.env.MEDIACONVERT_ROLE_ARN!,
    UserMetadata: { videoId },
    Settings: {
      Inputs: [
        {
          FileInput: `s3://${S3_BUCKET}/${inputKey}`,
          AudioSelectors: {
            "Audio Selector 1": { DefaultSelection: "DEFAULT" },
          },
        },
      ],
      OutputGroups: [
        {
          Name: "File Group",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: `s3://${S3_BUCKET}/videos/${videoId}/`,
            },
          },
          Outputs: [
            {
              NameModifier: "720p",
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    MaxBitrate: 3500000,
                    QvbrSettings: { QvbrQualityLevel: 7 },
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 128000,
                      SampleRate: 48000,
                      CodingMode: "CODING_MODE_2_0",
                    },
                  },
                },
              ],
              ContainerSettings: { Container: "MP4" },
            },
          ],
        },
      ],
    },
  });

  const result = await mediaConvert.send(command);
  return result.Job!.Id!;
}

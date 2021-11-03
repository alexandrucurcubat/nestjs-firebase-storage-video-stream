import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { getStorage } from 'firebase-admin/storage';

@Controller()
export class AppController {
  @Get('video')
  async streamVideo(@Req() request: Request, @Res() response: Response) {
    const range = request.headers.range;
    if (!range) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Range header is missing!');
    }

    const fileName = 'videos/video.mp4';
    const file = getStorage().bucket(process.env.GS_BUCKET).file(fileName);
    const metadata = await file.getMetadata();
    const size = metadata[0].size;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + 10 ** 6, size - 1);
    const contentLength = end - start + 1;

    response.status(HttpStatus.PARTIAL_CONTENT);
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Content-Type', 'video/mp4');
    response.setHeader('Content-Length', contentLength);
    response.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);

    file.createReadStream({ start, end }).pipe(response);
  }
}

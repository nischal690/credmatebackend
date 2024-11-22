import { Injectable } from '@nestjs/common';
import { FaceRecognitionService } from './services/face-recognition.service';

@Injectable()
export class SearchService {
  constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

  async searchByFace(imageBuffer: Buffer) {
    return this.faceRecognitionService.searchFaceByImage(imageBuffer);
  }

  // Future search methods can be added here
  // async searchByText(query: string) { ... }
  // async searchByLocation(coordinates: { lat: number; lng: number }) { ... }
}

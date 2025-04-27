import * as tf from '@tensorflow/tfjs';
import { PRODUCT_MAPPING } from './data';

export class NearestNeighbors {
  neighbors: number;
  data: tf.Tensor[];
  constructor(neighbors = 5) {
    this.neighbors = neighbors;
    this.data = [];
  }

  fit(data: tf.Tensor[]) {
    this.data = data;
  }

  cosineSimilarity(a: tf.Tensor, b: tf.Tensor) {
    const dotProduct = tf.dot(a, b).dataSync()[0];
    const magnitudeA = tf.norm(a).dataSync()[0];
    const magnitudeB = tf.norm(b).dataSync()[0];
    return dotProduct / (magnitudeA * magnitudeB);
  }

  euclideanDistance(a: tf.Tensor, b: tf.Tensor) {
    return tf.sqrt(tf.squaredDifference(a, b)).dataSync()[0];
  }

  kneighbors(point: tf.Tensor) {
    const distances = this.data.map((datapoint, index) => ({
      index,
      distance: this.cosineSimilarity(point, datapoint),
    }));

    distances.sort((a, b) => a.distance - b.distance);

    const neighborsIndices = distances
      .slice(0, this.neighbors)
      .map((item) => item.index);
    const neighbors = neighborsIndices.map((index) => this.data[index]);

    const result = {
      neighbors,
      distances: distances
        .slice(0, this.neighbors)
        .map((item) => item.distance),
    };
    const recommendations = result.neighbors.map((neighbor) => {
      const productIndex = neighbor.argMax(0).dataSync()[0];
      return PRODUCT_MAPPING[productIndex as keyof typeof PRODUCT_MAPPING];
    });
    return recommendations;
  }
}

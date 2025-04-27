import * as tf from '@tensorflow/tfjs';

export const PRODUCT_MAPPING = {
  0: 'Advil Pain Reliever',
  1: 'Amlodipina',
  2: 'Amoxicilina',
  3: 'Aspirina',
  4: 'Atenolol',
  5: 'citrato de potasio',
  6: 'Dayzol',
  7: 'Izaban',
  8: 'Meloxicam',
  9: 'Miovit',
  10: 'Vitamina C',
  11: 'Zithromax',
};

export const RECOMMENDATION_DATA = [
  tf.tensor([12.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 4.0]),
  tf.tensor([20.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 11.0]),
  tf.tensor([42.0, 4.0, 1.0, 11.0, 0.0, 4.0, 15.0, 4.0, 0.0, 2.0, 32.0, 29.0]),
  tf.tensor([15.0, 0.0, 0.0, 11.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0]),
  tf.tensor([29.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 9.0, 28.0]),
  tf.tensor([2.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0]),
  tf.tensor([2.0, 0.0, 0.0, 0.0, 0.0, 1.0, 2.0, 3.0, 2.0, 3.0, 0.0, 1.0]),
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoomType {
  id: string;
  name: string;
  image: string;
  pricePerNight: number;
  description: string;
  longDescription: string;
  minStay: number;
  occupancy: string;
  size: string;
  bedType: string;
  amenities: string[];
  features: string[];
  cloudbedsUrl: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface BookingDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  promoCode: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Location" | "Amenities" | "Café Discount";
}

export interface LocationHighlight {
  id: string;
  name: string;
  distance: string;
  timeWalking: string;
  description: string;
  category: "academic" | "medical" | "culture" | "coast";
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  stayDate: string;
  comment: string;
  roomStayed: string;
}

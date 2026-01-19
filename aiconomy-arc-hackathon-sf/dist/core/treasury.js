"use strict";
/**
 * Treasury Core Schemas
 * Defines the state of funds availability and reservation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationStatus = void 0;
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["ACTIVE"] = "ACTIVE";
    ReservationStatus["RELEASED"] = "RELEASED";
    ReservationStatus["SETTLED"] = "SETTLED";
    ReservationStatus["EXPIRED"] = "EXPIRED";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));

import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection.js";
import User from "./usersModel.js";
import Flight from "./flightModel.js";
import Seat from "./seatModel.js";

// Define Reservation model interface
export interface ReservationAttributes {
  ReservationID?: number; // Optional for creation
  UserID: number;
  FlightID: number;
  SeatID: number;
  BookingTime?: Date;
  user?: User; // User relationship
  flight?: Flight; // Flight relationship
  seat?: Seat; // Seat relationship

  createdAt?: Date; // Optional for creation
  updatedAt?: Date; // Optional for creation
}

// Define Reservation model class
class Reservation
  extends Model<ReservationAttributes>
  implements ReservationAttributes
{
  declare ReservationID: number;
  declare UserID: number;
  declare FlightID: number;
  declare SeatID: number;
  declare BookingTime: Date;
  declare user?: User;
  declare flight?: Flight;
  declare seat?: Seat;

  // Timestamps
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Initialize Reservation model
Reservation.init(
  {
    ReservationID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "UserID",
      },
    },
    FlightID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Flight,
        key: "FlightID",
      },
    },
    SeatID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Seat,
        key: "SeatID",
      },
      unique: true, // Each seat can only be reserved once
    },
    BookingTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Reservation",
    tableName: "Reservations",
    timestamps: true,
    indexes: [
      {
        name: "idx_reservation_user",
        fields: ["UserID"],
      },
      {
        name: "idx_reservation_flight",
        fields: ["FlightID"],
      },
      {
        name: "idx_reservation_seat",
        fields: ["SeatID"],
        unique: true,
      },
    ],
    hooks: {
      beforeCreate: async (reservation: Reservation) => {
        // Check that the seat being reserved is for the same flight as the reservation
        const seat = await Seat.findByPk(reservation.SeatID);
        if (!seat || seat.FlightID !== reservation.FlightID) {
          throw new Error(
            "The selected seat must belong to the specified flight"
          );
        }

        // Mark the seat as booked
        await Seat.update(
          { IsBooked: true },
          { where: { SeatID: reservation.SeatID } }
        );
      },
      afterDestroy: async (reservation: Reservation) => {
        // Free up the seat when reservation is cancelled
        await Seat.update(
          { IsBooked: false },
          { where: { SeatID: reservation.SeatID } }
        );
      },
    },
  }
);

export default Reservation;

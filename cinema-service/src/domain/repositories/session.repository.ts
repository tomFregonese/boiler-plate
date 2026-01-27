import { Session } from '../entities/session.entity';

export abstract class ISessionRepository {
    abstract findById(id: string): Promise<Session | null>;
    abstract findByFilmId(filmId: string): Promise<Session[]>;
    abstract findByCinemaId(cinemaId: string): Promise<Session[]>;
    abstract findByRoomIdAndDate(
        roomId: string,
        date: Date,
    ): Promise<Session[]>;
    abstract create(session: Session): Promise<Session>;
    abstract save(session: Session): Promise<Session>;
}

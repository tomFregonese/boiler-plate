import { Injectable } from '@nestjs/common';
import { BaseHttpAdapter } from '../../common/adapters/base-http.adapter.js';

@Injectable()
export class BookingAdapter extends BaseHttpAdapter {
    protected readonly serviceName = 'bookings';
    protected readonly baseUrl =
        process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3004';
}
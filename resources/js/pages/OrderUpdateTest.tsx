import { useEcho } from '@laravel/echo-react';

const OrderUpdateTest = () => {
    useEcho('orders', 'OrderStatusUpdatedEvent', (data: any) => {
        console.log('OrderStatusUpdatedEvent received:', data);
        console.log('Message:', data.message); // "from event!"
    });

    return null;
};

export default OrderUpdateTest;

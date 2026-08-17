import React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '../UI/carousel';
import { Star } from 'lucide-react';
import { IoStarSharp } from 'react-icons/io5';

const Reviews = () => {
    const reviews = [
        {
            name: 'Komal Thakur',
            image: 'https://res.cloudinary.com/domli7sla/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1752777791/Review-3_g8ufyi.jpg',
            rating: 5,
            review: 'The instructors provided personalized guidance throughout the course. I now speak German confidently!'
        },
        {
            name: 'Mina Kosari',
            image: 'https://res.cloudinary.com/domli7sla/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1752777791/Review-1_nned4o.jpg',
            rating: 5,
            review: 'Their curriculum is structured, interactive, and aligned with CEFR standards. Exceptional experience.'
        },
        {
            name: 'Madhulekha Bhattacahriya',
            image: 'https://res.cloudinary.com/domli7sla/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1752777791/Review-2_zwga08.webp',
            rating: 5,
            review: 'I managed to learn at my own pace and passed my A2 certification with ease thanks to their teaching approach.'
        },
    ];

    return (
        <section className="relative z-10 mt-4 mb-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-14">


            <h2 className="text-center py-6 text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">Hear From <span className="text-primary">Our Students</span></h2>


            <div className="p-8 lg:overflow-hidden">
                <Carousel >
                    <CarouselContent>
                        {reviews.map((review) => (
                            <CarouselItem className="lg:basis-1/3 md:basis-2/3">

                                <div className="p-5 bg-gradient-to-tr from-bg2 to-bg rounded-xl  flex flex-col gap-3 items-center justify-around text-center aspect-square">

                                    <div className="flex gap-3">{Array.from({ length: review.rating }).map((i) => (<Star key={i} className="w-4 h-4 fill-tertiary text-tertiary" />))}</div>

                                    <p className="text-secondary text-end text-sm italic">"<span className='text-white'>{review.review}</span>"</p>

                                    <div className="rounded-full overflow-hidden  h-50  w-50 flex-shrink-0"><img src={review.image} className="h-full w-full object-cover scale-105" /></div>

                                    <h4 className="font-bold text-white text-xl">{review.name}</h4>

                                </div>

                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>

            <div className="flex align-center justify-center shrink-0">
                <a href="https://www.trustpilot.com/review/www.exzellent.co" target="_blank"
                    className="bg-white hover:bg-teal-50 text-green-300 p-2 border text-2xl hover:text-3xl border-green-300 group rounded-lg transition-all duration-500 flex gap-1 justify-center">
                    <p className="text-black text-sm group-hover:text-base transition-all duration-500">Review us on</p>
                    <IoStarSharp />
                    <span className="font-semibold text-black text-base group-hover:text-lg transition-all duration-500">Trustpilot</span>
                </a>
            </div>

        </section>
    );
};

export default Reviews;

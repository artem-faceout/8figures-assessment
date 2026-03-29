import {
  trigger,
  transition,
  style,
  animate,
  query,
} from '@angular/animations';

export const stepTransition = trigger('stepTransition', [
  transition(':increment', [
    query(':enter', [style({ opacity: 0, transform: 'translateX(30px)' })], { optional: true }),
    query(':leave', [animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-30px)' }))], { optional: true }),
    query(':enter', [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))], { optional: true }),
  ]),
  transition(':decrement', [
    query(':enter', [style({ opacity: 0, transform: 'translateX(-30px)' })], { optional: true }),
    query(':leave', [animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(30px)' }))], { optional: true }),
    query(':enter', [animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))], { optional: true }),
  ]),
]);

export const fadeInUp = trigger('fadeInUp', [
  transition('void => *', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const scaleIn = trigger('scaleIn', [
  transition('void => *', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
]);

import { render } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  it('should create the app', async () => {
    const { fixture } = await render(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

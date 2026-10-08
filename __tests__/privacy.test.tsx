import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Linking, Text } from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import PrivacyLink from '../src/components/PrivacyLink';
import { PRIVACY_URL } from '../src/constant/Constants';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// Only the plain strings: the link text is a nested <Text>, so keep it in its own entry.
const texts = (r: any) =>
  r.root.findAllByType(Text).map((t: any) => [].concat(t.props.children).filter((c: any) => typeof c === 'string').join(''));
const tapLink = (r: any) => r.root.findAll((n: any) => n.props && n.props.accessibilityRole === 'link' && n.props.onPress)[0].props.onPress();

test('the policy link points at the policy page and opens it in the browser', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
  expect(PRIVACY_URL).toBe('https://samsara.b2bcampus.com/privacy/drivequiz');
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<PrivacyLink />); });
  await act(async () => { tapLink(r); });
  expect(open).toHaveBeenCalledWith('https://samsara.b2bcampus.com/privacy/drivequiz');
  open.mockRestore();
});

test('a link that fails to open does not crash the app', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<PrivacyLink />); });
  await act(async () => { tapLink(r); });
  expect(warn).toHaveBeenCalled();
  open.mockRestore();
  warn.mockRestore();
});

test('Home shows the Privacy Policy link', async () => {
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<HomeScreen navigate={() => {}} />); });
  expect(texts(r).join(' ')).toContain('Privacy Policy');
});

test('Onboarding shows the link, and it is only usable on the last slide', async () => {
  let r: any;
  await act(async () => { r = ReactTestRenderer.create(<OnboardingScreen navigate={() => {}} />); });
  expect(texts(r)).toContain('By continuing, you agree to our ');
  expect(texts(r)).toContain('Privacy Policy');
  const link = r.root.findByType(PrivacyLink);
  expect(link.props.pointerEvents).toBe('none');           // slide 1: hidden and not tappable
});

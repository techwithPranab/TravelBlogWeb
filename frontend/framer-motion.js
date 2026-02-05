// Mock framer-motion for SSR compatibility
// This allows builds to succeed while animations are disabled

const React = require('react');

const createMotionComponent = (tag) => {
  const Component = ({ children, ...props }) => {
    // Remove framer-motion specific props
    const cleanProps = { ...props };
    delete cleanProps.initial;
    delete cleanProps.animate;
    delete cleanProps.exit;
    delete cleanProps.whileInView;
    delete cleanProps.whileHover;
    delete cleanProps.whileTap;
    delete cleanProps.transition;
    delete cleanProps.viewport;
    delete cleanProps.variants;
    delete cleanProps.layout;
    delete cleanProps.layoutId;

    return React.createElement(tag, cleanProps, children);
  };
  Component.displayName = `MockMotion${tag}`;
  return Component;
};

const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  h4: createMotionComponent('h4'),
  h5: createMotionComponent('h5'),
  h6: createMotionComponent('h6'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  img: createMotionComponent('img'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  nav: createMotionComponent('nav'),
  aside: createMotionComponent('aside'),
  main: createMotionComponent('main'),
  table: createMotionComponent('table'),
  thead: createMotionComponent('thead'),
  tbody: createMotionComponent('tbody'),
  tr: createMotionComponent('tr'),
  th: createMotionComponent('th'),
  td: createMotionComponent('td'),
  form: createMotionComponent('form'),
  input: createMotionComponent('input'),
  textarea: createMotionComponent('textarea'),
  select: createMotionComponent('select'),
  option: createMotionComponent('option'),
  g: createMotionComponent('g'),
  path: createMotionComponent('path'),
  circle: createMotionComponent('circle'),
  rect: createMotionComponent('rect'),
  svg: createMotionComponent('svg')
};

const AnimatePresence = ({ children }) => children;

const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {}
});

const useInView = () => [false, {}];

const useMotionValue = (initial) => ({
  get: () => initial,
  set: () => {},
  onChange: () => () => {}
});

const animate = () => Promise.resolve();

module.exports = {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useMotionValue,
  animate
};

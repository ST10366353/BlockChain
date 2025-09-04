import React from 'react';
// Global type declarations for the project

// Extend Jest matchers for testing-library/jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text?: string | RegExp): R;
      toHaveValue(value?: string | number | string[]): R;
      toBeDisabled(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveFocus(): R;
    }
  }

  // JSX namespace declaration for React components
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }

  // Global React utilities
  const React: typeof import('react');
  const createElement: typeof React.createElement;

  // Extend Window interface for test utilities
  interface Window {
    React: typeof React;
    createElement: typeof React.createElement;
  }
}

export {};

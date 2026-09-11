import React, { useState } from 'react';
import MainLayout from './layout/MainLayout';
import { Button, TextField, Card } from './common';
import toast from 'react-hot-toast';

export const ComponentShowcase = () => {
  const [textValue, setTextValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorValue, setErrorValue] = useState('Invalid input example');
  const [btnLoading, setBtnLoading] = useState(false);

  const handleTestClick = (name) => {
    toast.success(`${name} clicked!`);
  };

  const toggleLoading = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.success('Action completed!');
    }, 1500);
  };

  return (
    <MainLayout maxWidth="1100px">
      <div className="showcase-header">
        <div className="welcome-badge">UI Library & Design System</div>
        <h1 className="text-2xl font-bold text-neutral-0">Reusable Common Components</h1>
        <p className="text-sm text-neutral-400">
          Standardized UI building blocks established for the RideSmart application modules.
        </p>
      </div>

      {/* 1. Buttons Section */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title">1. Buttons (<code>&lt;Button /&gt;</code>)</h2>
          <p className="section-subtitle">Various style variants, sizes, and states</p>
        </div>

        <Card variant="glass" className="p-6">
          <h4 className="text-sm font-semibold text-neutral-300 mb-3">Variants</h4>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button variant="primary" onClick={() => handleTestClick('Primary Button')}>
              Primary Button
            </Button>
            <Button variant="secondary" onClick={() => handleTestClick('Secondary Button')}>
              Secondary Button
            </Button>
            <Button variant="outline" onClick={() => handleTestClick('Outline Button')}>
              Outline Button
            </Button>
            <Button variant="danger" onClick={() => handleTestClick('Danger Button')}>
              Danger Button
            </Button>
            <Button variant="ghost" onClick={() => handleTestClick('Ghost Button')}>
              Ghost Button
            </Button>
          </div>

          <h4 className="text-sm font-semibold text-neutral-300 mb-3">Sizes & States</h4>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button size="sm" variant="primary">Small Size</Button>
            <Button size="md" variant="primary">Medium (Default)</Button>
            <Button size="lg" variant="primary">Large Size</Button>
            <Button variant="primary" loading={btnLoading} onClick={toggleLoading}>
              {btnLoading ? 'Processing...' : 'Click for Loading State'}
            </Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>

          <h4 className="text-sm font-semibold text-neutral-300 mb-3">With Icons</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            >
              Search Bus
            </Button>
            <Button
              variant="outline"
              rightIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              }
            >
              View Route
            </Button>
          </div>
        </Card>
      </section>

      {/* 2. TextFields Section */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title">2. Text Fields (<code>&lt;TextField /&gt;</code>)</h2>
          <p className="section-subtitle">Inputs with built-in labels, icons, error handling, and password toggles</p>
        </div>

        <Card variant="glass" className="p-6">
          <div className="grid grid-2 gap-4">
            <TextField
              label="Standard Text Input"
              placeholder="Enter destination..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              helperText="E.g. Dhaka, Chittagong, Rajshahi"
            />

            <TextField
              label="Input with Icon"
              placeholder="Starting city"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
              }
            />

            <TextField
              label="Password Input with Visibility Toggle"
              isPassword
              placeholder="Enter password..."
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />

            <TextField
              label="Input with Validation Error"
              value={errorValue}
              onChange={(e) => setErrorValue(e.target.value)}
              error="This field contains an invalid format"
            />
          </div>
        </Card>
      </section>

      {/* 3. Cards Section */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title">3. Cards (<code>&lt;Card /&gt;</code>)</h2>
          <p className="section-subtitle">Compound container cards with headers, bodies, footers, and hover variants</p>
        </div>

        <div className="grid grid-3 gap-4">
          <Card variant="glass">
            <Card.Header>
              <Card.Title>Glassmorphism Card</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-sm text-neutral-400">
                Default glass container with backdrop blur, subtle borders, and glow reflections.
              </p>
            </Card.Body>
            <Card.Footer>
              <span className="badge badge-primary">Default</span>
            </Card.Footer>
          </Card>

          <Card variant="interactive" onClick={() => handleTestClick('Interactive Card')}>
            <Card.Header>
              <Card.Title>Interactive / Clickable Card</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-sm text-neutral-400">
                Card with active hover translation, glowing border highlights, and cursor pointer.
              </p>
            </Card.Body>
            <Card.Footer>
              <span className="badge badge-success">Hover Me</span>
            </Card.Footer>
          </Card>

          <Card variant="solid">
            <Card.Header>
              <Card.Title>Solid Surface Card</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="text-sm text-neutral-400">
                Opaque surface background with high contrast for dense operational data.
              </p>
            </Card.Body>
            <Card.Footer>
              <span className="badge badge-primary">Solid</span>
            </Card.Footer>
          </Card>
        </div>
      </section>

      {/* 4. Common Design Tokens */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title">4. Theme Tokens & Utilities</h2>
          <p className="section-subtitle">Standard typography scale, spacing tokens, and color tokens</p>
        </div>

        <Card variant="glass" className="p-6">
          <div className="grid grid-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-200 mb-3">Color Swatches</h4>
              <div className="flex flex-wrap gap-2">
                <div className="color-chip bg-primary" title="Emerald Primary: #059669">Emerald</div>
                <div className="color-chip bg-teal" title="Teal: #0d9488">Teal</div>
                <div className="color-chip bg-mint" title="Mint: #14b8a6">Mint</div>
                <div className="color-chip bg-sage" title="Sage: #15803d">Sage</div>
                <div className="color-chip bg-error" title="Error: #ef4444">Error</div>
                <div className="color-chip bg-warning" title="Warning: #f59e0b">Warning</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-neutral-200 mb-3">Typography Classes</h4>
              <div className="flex flex-col gap-1 text-neutral-300">
                <span className="text-xs"><code>.text-xs</code> — Extra Small text</span>
                <span className="text-sm"><code>.text-sm</code> — Small text (Body secondary)</span>
                <span className="text-base"><code>.text-base</code> — Base text (Body primary)</span>
                <span className="text-lg font-semibold"><code>.text-lg</code> — Large subtitle</span>
                <span className="text-xl font-bold"><code>.text-xl</code> — Heading text</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </MainLayout>
  );
};

export default ComponentShowcase;

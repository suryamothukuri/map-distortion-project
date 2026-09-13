import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HomePage } from '../pages/HomePage';
import { ExplorePage } from '../pages/ExplorePage';
import { LearnPage } from '../pages/LearnPage';
import { LabPage } from '../pages/LabPage';
import { ComparePage } from '../pages/ComparePage';
import { RepresentationPage } from '../pages/RepresentationPage';
import { WorldPage } from '../pages/WorldPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { DataPage } from '../pages/DataPage';
import { AtlasBot } from '../components/AtlasBot';
import { ParticleBackground } from '../components/ParticleBackground';
import { CinematicIntro } from '../components/CinematicIntro';
import { createDataProvider, DataProvider } from '../data/dataProvider';

export const App: React.FC = () => {
  const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Show on initial session, remember if user entered
    return !sessionStorage.getItem('atlas_intro_seen');
  });

  useEffect(() => {
    createDataProvider().then(setDataProvider);
  }, []);

  const handleEnterAtlas = () => {
    sessionStorage.setItem('atlas_intro_seen', 'true');
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  if (!dataProvider) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#090d16', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 className="serif" style={{ marginBottom: '0.5rem', color: '#38bdf8' }}>Initializing True Size Atlas...</h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Booting real-scale geometric spatial warp engine</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {showIntro && <CinematicIntro onEnter={handleEnterAtlas} />}
      <ParticleBackground />

      <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
        <Header providerMode={dataProvider.mode} onReplayIntro={handleReplayIntro} />
        <main id="main-content" className="main-content">
          <Routes>
            <Route path="/" element={<HomePage dataProvider={dataProvider} />} />
            <Route path="/explore" element={<ExplorePage dataProvider={dataProvider} />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/lab" element={<LabPage dataProvider={dataProvider} />} />
            <Route path="/compare" element={<ComparePage dataProvider={dataProvider} />} />
            <Route path="/representation" element={<RepresentationPage dataProvider={dataProvider} />} />
            <Route path="/world" element={<WorldPage dataProvider={dataProvider} />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/data" element={<DataPage dataProvider={dataProvider} />} />
          </Routes>
        </main>
        <AtlasBot />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

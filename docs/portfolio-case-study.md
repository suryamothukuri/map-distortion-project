# Portfolio Case Study: Engineering The Map Distortion Project

## Executive Summary
The Map Distortion Project is an interactive portfolio showcase built to solve a long-standing communication challenge in geospatial literacy: explaining cartographic projection distortion with absolute mathematical precision and zero cloud infrastructure costs.

## Key Engineering Challenges & Solutions

### 1. High-Precision Spherical Geometry vs. Flat Screen Artifacts
Traditional mapping libraries either use flat planar approximations or heavy GIS database extensions. We implemented a lightweight, zero-dependency spherical geometry package (`@map-distortion/geo`) that models the Earth as an exact sphere with $R = 6,371,007.1809\text{ m}$ and handles antimeridian seam crossing and $\pm 85^\circ$ clipping.

### 2. Rigid 3D Quaternion Kinematics
To allow visitors to drag countries across the globe without shape or area drift, we avoided naive Cartesian coordinate translation and implemented shortest-arc unit quaternion rotations ($v' = q v q^{-1}$). This mathematically guarantees that spherical surface area is 100.0% invariant during motion.

### 3. Dorling Cartogram with Deterministic Layouts
Instead of slow server-side cartogram computations, we implemented a deterministic D3 force collision engine anchored to Equal Earth country centroids, ensuring circle areas strictly follow $r = c \sqrt{X / \pi}$ with zero overlap.

### 4. Zero-Cost Architecture & Offline Resilience
Using a dual `DataProvider` abstraction, the frontend runs with 100% feature parity whether connected to the live FastAPI analytical server or executing completely offline from bundled snapshot assets.

# Mathematical Methodology & Scientific Specifications

## 1. Coordinate and Earth Model
- **Earth Radius**: $R = 6,371,007.1809\text{ meters}$.
- **Spherical Surface Area**: $4 \pi R^2 \approx 510,065,628\text{ km}^2$.
- **Comparison Domain**: $C = \{ -180^\circ \le \lambda \le 180^\circ, |\phi| \le 85^\circ \}$.

## 2. Local Mercator Projection Equations
$$\begin{aligned}
x &= R \lambda \\
y &= R \ln\left(\tan\left(\frac{\pi}{4} + \frac{\phi}{2}\right)\right) \\
k(\phi) &= \sec(\phi) = \frac{1}{\cos(\phi)} \quad \text{(linear scale)} \\
J(\phi) &= \sec^2(\phi) = \frac{1}{\cos^2(\phi)} \quad \text{(area multiplier)}
\end{aligned}$$

## 3. Country Area Inflation Factor (AF) & Distortion Index (DI)
$$\begin{aligned}
AF_i &= \frac{P_i}{A_i} \\
DI_i &= 100 \times (AF_i - 1)
\end{aligned}$$

## 4. Projection Representation Index (PRI) & Visual Power Gap
$$\begin{aligned}
\text{land\_share}_i &= \frac{A_i}{\sum_{j \in S} A_j} \\
\text{map\_share}_i &= \frac{P_i}{\sum_{j \in S} P_j} \\
PRI_i &= \frac{\text{map\_share}_i}{\text{land\_share}_i} \\
\text{VisualPowerGap}_i &= 100 \times (\text{map\_share}_i - \text{land\_share}_i)
\end{aligned}$$

## 5. Rigid 3D Spherical Kinematics via Shortest-Arc Quaternions
For source anchor unit vector $u_a$ and destination anchor unit vector $u_b$:
$$q = \left[ 1 + u_a \cdot u_b, \; u_a \times u_b \right] / \|q\|$$
For every polygon vertex $v$:
$$v' = q \cdot v \cdot q^{-1}$$
This guarantees exact distance and surface area conservation on the sphere.

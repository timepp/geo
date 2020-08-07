type Point2D = [number, number]

interface PointTriangleRelation {
    inside: boolean,
    outside: boolean,
    onEdge: boolean,
    onExtendEdge: boolean,
    isVertex: boolean,
    isA?: boolean,
    isB?: boolean,
    isC?: boolean,
    onAB?: boolean,
    onBC?: boolean,
    onCA?: boolean,
    onExtendAB?: boolean,
    onExtendBA?: boolean,
    onExtendBC?: boolean,
    onExtendCB?: boolean,
    onExtendCA?: boolean,
    onExtendAC?: boolean,
    outsideA?: boolean,
    outsideB?: boolean,
    outsideC?: boolean,
    outsideAB?: boolean,
    outsideBC?: boolean,
    outsideCA?: boolean
}

/** Get cross product from OP to OQ
 */
export function crossProduct(P: Point2D, Q: Point2D, O: Point2D = [0, 0]) {
    return (P[0] - O[0]) * (Q[1] - O[1]) - (P[1] - O[1]) * (Q[0] - O[0])
}

/** Get rotation direct from A->B->C->A */
export function rotationDirection(A: Point2D, B: Point2D, C: Point2D) : 1 | -1 {
    return crossProduct(B, C, A) > 0 ? 1 : -1
}

/** Get relationship code between a point and a triangle
 */
export function relationPTC(P: Point2D, A: Point2D, B: Point2D, C: Point2D): [number, number, number] {
    const pab = crossProduct(A, B, P)
    const pbc = crossProduct(B, C, P)
    const pca = crossProduct(C, A, P)
    const dir = rotationDirection(A, B, C)
    return [
        Math.sign(pab) * dir,
        Math.sign(pbc) * dir,
        Math.sign(pca) * dir
    ]
}

export function pointInRectangle(P: Point2D, A: Point2D, B: Point2D) {
    return (A[0] <= P[0]) == (P[0] <= B[0])
        && (A[1] <= P[1]) == (P[1] <= B[1])
}

export function pointInLineSegment(P: Point2D, A: Point2D, B: Point2D) {
    return pointInRectangle(P, A, B) && crossProduct(A, B, P) == 0
}

/** Get relationship code between a point and a polygon
 */
export function relationPP(P: Point2D, polygon: Point2D[]) {
    // ray-casting algorithm
    let inside = false
    for (let i = 0; i < polygon.length - 1; i++) {
        const p1 = polygon[i]
        const p2 = polygon[(i + 1) % polygon.length]
        if ((p1[1] <= P[1]) == (P[1] <= p2[1])) {
            if (p1[1] == p2[1]) {
                if ((p1[0] <= P[0]) == (P[0] <= p2[0])) return 0
            } else {
                const c = crossProduct(p1, p2, P)
                console.debug(c, p1, p2, P)
                if (c == 0) return 0
                if ((p1[1] < p2[1]) == (c > 0)) inside = !inside
            }
        }
    }

    return inside? 1 : -1
}

export function relationPT(P: Point2D, A: Point2D, B: Point2D, C: Point2D): PointTriangleRelation {
    const [u, v, w] = relationPTC(P, A, B, C)
    let s = u + v + w
    let t = u * v * w
    let r : PointTriangleRelation = {
        inside: s == 3,
        onEdge: t == 0 && s > 0,
        onExtendEdge: t == 0 && s <= 0,
        outside: t != 0 && s < 3,
        isVertex: t == 0 && s == 1
    }

    switch (u * 9 + v * 3 + w) {
        case 3:   r.isA = true; break
        case 1:   r.isB = true; break
        case 9:   r.isC = true; break
        case 4:   r.onAB = true; break
        case 10:  r.onBC = true; break
        case 12:  r.onCA = true; break
        case 2:   r.onExtendBA = true; break
        case -6:  r.onExtendCA = true; break
        case -2:  r.onExtendAB = true; break
        case -8:  r.onExtendCB = true; break
        case 6:   r.onExtendAC = true; break
        case 8:   r.onExtendBC = true; break
        case -7:  r.outsideA = true; break
        case -5:  r.outsideAB = true; break
        case -11: r.outsideB = true; break
        case 7:   r.outsideBC = true; break
        case 5:   r.outsideC = true; break
        case 11:  r.outsideCA = true; break
    }

    return r
}

export function area(points: Point2D[]) {
    // 012, 023, 034, ..., 0 n-1 n
    let r = 0
    for (let i = 2; i < points.length; i++) {
        r += crossProduct(points[i-1], points[i], points[0])
    }
    return r/2
}

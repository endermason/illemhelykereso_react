import React, { useState, useEffect } from 'react';
import { Col, ToggleButton } from 'react-bootstrap';

const Filters = ({ setFilterFunction }) => {
  const [filters, setFilters] = useState({
    accessible: false,
    free: false,
    public: false,
    open: false,
  });

  useEffect(() => {
    setFilterFunction(() => (place) => {
        if (filters.accessible && !place.accessible) return false;
        if (filters.free && place.price !== 0) return false;
        if (filters.public && !place.public) return false;

        let now = new Date();   // Date objektum inicializálása
        let nowHour = now.getHours();   // Aktuális óra lekérése
        let nowMinute = now.getMinutes();   // Aktuális perc lekérése
        let day = (((now.getDay() - 1) + 7) % 7);   // Aktuális nap lekérése és átalakítása 0-6 közötti számmá, ahol 0 a hétfő (a js now.getDay() 0-6 közötti számokat ad vissza, ahol 0 a vasárnap)
        let opening = place.opening_times[day];     // Az adott napi nyitvatartási idő lekérése, pl. "08:00-20:00"
        if (filters.open) {
            let openingTime = opening.split('-')[0].split(':').map(Number);  // Az adott napi nyitvatartási idő kezdete átalakítva számokká, pl. [8, 0]
            let closingTime = opening.split('-')[1].split(':').map(Number);  // Az adott napi nyitvatartási idő vége átalakítva számokká, pl. [20, 0]
            if (nowHour < openingTime[0] || nowHour > closingTime[0]) return false; // Ha az aktuális óra kisebb, mint a nyitvatartási idő kezdete, vagy nagyobb, mint a nyitvatartási idő vége, akkor false
            if (nowHour === openingTime[0] && nowMinute < openingTime[1]) return false; // Ha az aktuális óra egyenlő a nyitvatartási idő kezdetével, és a perc kisebb, mint a nyitvatartási idő kezdetének perce, akkor false
            if (nowHour === closingTime[0] && nowMinute > closingTime[1]) return false; // Ha az aktuális óra egyenlő a nyitvatartási idő végével, és a perc nagyobb, mint a nyitvatartási idő végének perce, akkor false
        }
        return true;    // Különben true
    });
  }, [filters, setFilterFunction]);

  return (
    <>
      <Col>
            <ToggleButton
                className="mb-2"
                id="accessible-check"
                type="checkbox"
                variant="outline-primary"
                checked={filters.accessible}
                onChange={(e) => {
                    let newFilters = { ...filters };
                    newFilters.accessible = e.target.checked;
                    setFilters(newFilters);
                }}
            >
                <span>Akadálymentes</span>
            </ToggleButton>
        </Col>
        <Col>
            <ToggleButton
                className="mb-2"
                id="free-check"
                type="checkbox"
                variant="outline-primary"
                checked={filters.free}
                onChange={(e) => {
                    let newFilters = { ...filters };
                    newFilters.free = e.target.checked;
                    setFilters(newFilters);
                }}
            >
                <span>Ingyenes</span>
            </ToggleButton>
        </Col>
        <Col>
            <ToggleButton
                className="mb-2"
                id="public-check"
                type="checkbox"
                variant="outline-primary"
                checked={filters.public}
                onChange={(e) => {
                    let newFilters = { ...filters };
                    newFilters.public = e.target.checked;
                    setFilters(newFilters);
                }}
            >
                <span>Nyilvános</span>
            </ToggleButton>
        </Col>
        <Col>
            <ToggleButton
                id="open-check"
                type="checkbox"
                variant="outline-primary"
                checked={filters.open}
                onChange={(e) => {
                    let newFilters = { ...filters };
                    newFilters.open = e.target.checked;
                    setFilters(newFilters);
                }}
            >
                <span>Most nyitva van</span>
            </ToggleButton>
        </Col>
    </>
  );
};

export default Filters;
/* GitHub contribution heatmap — last 6 months
 *
 * Fetches the public, no-auth contributions JSON from
 * github-contributions-api.jogruber.de (the same data source that
 * react-github-calendar uses), filters to roughly the last 26 weeks,
 * and renders a custom SVG heatmap in the project's monochrome
 * Apple-glass palette.
 *
 * Markup expected:
 *   <div id="github-graph" data-username="Debarghyasg"></div>
 *
 * No external dependencies, no API token required.
 */
(function () {
  "use strict";

  // GitHub's official dark-theme contribution palette.
  // Index 0 = no contributions, 4 = busiest day.
  const LEVEL_COLORS = [
    "#161b22", // empty cell
    "#0e4429", // 1 — dark green
    "#006d32", // 2
    "#26a641", // 3
    "#39d353", // 4 — bright green
  ];

  const CELL = 11;   // px, cell width/height
  const GAP = 3;     // px, gap between cells
  const STEP = CELL + GAP;
  const TOP_PAD = 22;   // room for month labels
  const LEFT_PAD = 28;  // room for day-of-week labels
  const RIGHT_PAD = 8;
  const BOTTOM_PAD = 28; // room for the legend

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function dateKey(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function startOfWeekSunday(d) {
    const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    out.setDate(out.getDate() - out.getDay()); // Sunday = 0
    return out;
  }

  function fmtTooltip(date, count) {
    const d = new Date(date);
    const opts = { year: "numeric", month: "short", day: "numeric" };
    const human = d.toLocaleDateString(undefined, opts);
    if (count === 0) return "No contributions on " + human;
    if (count === 1) return "1 contribution on " + human;
    return count.toLocaleString() + " contributions on " + human;
  }

  function escapeXml(s) {
    return String(s).replace(/[<>&"']/g, function (c) {
      return ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c];
    });
  }

  function buildSvg(weeks, total, dateRangeText) {
    const numWeeks = weeks.length;
    const width = LEFT_PAD + numWeeks * STEP - GAP + RIGHT_PAD;
    const height = TOP_PAD + 7 * STEP - GAP + BOTTOM_PAD;

    const parts = [];
    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height +
      '" width="' + width + '" height="' + height + '" role="img" aria-label="GitHub contribution graph for the last 6 months">'
    );

    // Day labels (rows): show only Mon, Wed, Fri
    const dayLabels = [
      { row: 1, text: "Mon" },
      { row: 3, text: "Wed" },
      { row: 5, text: "Fri" },
    ];
    dayLabels.forEach(function (dl) {
      const y = TOP_PAD + dl.row * STEP + CELL - 2;
      parts.push(
        '<text x="0" y="' + y + '" class="gg-label">' + dl.text + "</text>"
      );
    });

    // Month labels: place a label above the first week-column whose first
    // cell falls into a new calendar month.
    let lastMonth = -1;
    weeks.forEach(function (week, wi) {
      let probe = null;
      for (let i = 0; i < week.length; i++) {
        if (week[i]) { probe = week[i]; break; }
      }
      if (!probe) return;
      const m = new Date(probe.date).getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        const x = LEFT_PAD + wi * STEP;
        parts.push(
          '<text x="' + x + '" y="14" class="gg-label">' + MONTHS[m] + "</text>"
        );
      }
    });

    // Cells
    weeks.forEach(function (week, wi) {
      week.forEach(function (cell, di) {
        if (!cell) return;
        const x = LEFT_PAD + wi * STEP;
        const y = TOP_PAD + di * STEP;
        const lvl = Math.max(0, Math.min(4, cell.level | 0));
        parts.push(
          '<rect x="' + x + '" y="' + y +
          '" width="' + CELL + '" height="' + CELL +
          '" rx="2" ry="2" fill="' + LEVEL_COLORS[lvl] + '">' +
          "<title>" + escapeXml(fmtTooltip(cell.date, cell.count)) + "</title>" +
          "</rect>"
        );
      });
    });

    // Legend (bottom-right)
    const legendY = TOP_PAD + 7 * STEP + 10;
    const legendStartX = width - RIGHT_PAD - (5 * (CELL + 4) + 60);
    parts.push(
      '<text x="' + legendStartX + '" y="' + (legendY + CELL - 2) +
      '" class="gg-label">Less</text>'
    );
    for (let i = 0; i < 5; i++) {
      const x = legendStartX + 36 + i * (CELL + 4);
      parts.push(
        '<rect x="' + x + '" y="' + legendY +
        '" width="' + CELL + '" height="' + CELL +
        '" rx="2" ry="2" fill="' + LEVEL_COLORS[i] + '"/>'
      );
    }
    parts.push(
      '<text x="' + (legendStartX + 36 + 5 * (CELL + 4) + 4) + '" y="' + (legendY + CELL - 2) +
      '" class="gg-label">More</text>'
    );

    parts.push("</svg>");

    const totalLabel =
      total.toLocaleString() + " contribution" + (total === 1 ? "" : "s") +
      " in the last 6 months";

    return (
      '<div class="gg-meta">' +
        '<span class="gg-total">' + totalLabel + "</span>" +
        (dateRangeText ? '<span class="gg-range">' + escapeXml(dateRangeText) + "</span>" : "") +
      "</div>" +
      '<div class="gg-svg-wrap">' + parts.join("") + "</div>"
    );
  }

  function renderError(container, username) {
    container.innerHTML =
      '<div class="gg-error">' +
        "Couldn't load GitHub contributions right now. " +
        '<a href="https://github.com/' + encodeURIComponent(username) + '" target="_blank" rel="noopener">' +
        "View on GitHub" + "</a>." +
      "</div>";
  }

  async function load(container) {
    const username = container.getAttribute("data-username");
    if (!username) return;

    container.innerHTML =
      '<div class="gg-loading">Loading the last 6 months from GitHub…</div>';

    try {
      const url =
        "https://github-contributions-api.jogruber.de/v4/" +
        encodeURIComponent(username) + "?y=last";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const all = Array.isArray(data.contributions) ? data.contributions : [];
      if (!all.length) throw new Error("No contributions data");

      // Filter to the last ~6 months, snapped to a Sunday so weeks align cleanly.
      const today = new Date();
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      const start = startOfWeekSunday(sixMonthsAgo);

      const inWindow = all.filter(function (c) {
        return new Date(c.date) >= start;
      });
      if (!inWindow.length) throw new Error("No data in window");

      // Build the (weeks × 7) grid by date.
      const byDate = Object.create(null);
      let total = 0;
      inWindow.forEach(function (c) {
        byDate[c.date] = c;
        total += (c.count | 0);
      });

      const weeks = [];
      const cursor = new Date(start);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      while (cursor <= end) {
        const week = new Array(7).fill(null);
        for (let day = 0; day < 7; day++) {
          if (cursor > end) break;
          const k = dateKey(cursor);
          if (byDate[k]) {
            week[day] = byDate[k];
          } else {
            week[day] = { date: k, count: 0, level: 0 };
          }
          cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
      }

      const dateRange =
        start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
        "  →  " +
        end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

      container.innerHTML = buildSvg(weeks, total, dateRange);
    } catch (err) {
      console.warn("[github-graph]", err);
      renderError(container, username);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll("#github-graph[data-username]");
    containers.forEach(load);
  });
})();

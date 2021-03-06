/* eslint-disable no-console, no-process-exit */
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const MIKKELSEN_IMDB_ID = 'nm0586568';

async function sandbox (actor) {
  try {
    console.log(`📽️  fetching filmography of ${actor}...`);
    const movies = await imdb(actor);
    const awesome = movies.filter(movie => movie.metascore >= 70);

    console.log(`🍿 ${movies.length} movies found.`);
    console.log(JSON.stringify(movies, null, 2));
    console.log(`🥇 ${awesome.length} awesome movies found.`);
    console.log(JSON.stringify(awesome, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

sandbox(DENZEL_IMDB_ID);

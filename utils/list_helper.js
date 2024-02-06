const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let likesTotal = blogs.reduce(function (sum, blog) {
    return sum + blog.likes;
  }, 0);
  return likesTotal;
};

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    likes: blog.likes,
  };
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const lajiteltuTalulukko = blogs.sort((a, b) => a.likes - b.likes);
  return formatBlog(lajiteltuTalulukko[lajiteltuTalulukko.length - 1]);
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  // haetaan pohjat
  const taulukko = [];
  for (let i = 0; i < blogs.length; i++) {
    taulukko.push(blogs[i].author);
  }
  const sortattuTaulukko = taulukko.sort();

  // eka hlö pois ja käsittelyn pohjaksi
  let kirjailija = sortattuTaulukko.shift();
  let kpl = 1;

  for (let i = 0; i < sortattuTaulukko.length; i++) {
    if (kirjailija === sortattuTaulukko[i]) {
      kpl++;
    }
  }

  // Käydään taulukko läpi...
  for (let i = 0; i < sortattuTaulukko.length; i++) {
    let kasittelyssa = sortattuTaulukko[i];
    if (kasittelyssa !== kirjailija) {
      let kpl2 = 0;
      for (let i = 0; i < sortattuTaulukko.length; i++) {
        if (kasittelyssa === sortattuTaulukko[i]) {
          kpl2++;
        }
      }
      if (kpl2 > kpl) {
        kpl = kpl2;
        kirjailija = kasittelyssa;
      }
    }
  }
  return { author: kirjailija, blogs: kpl };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  // sortataan taulukko nimen mukaan...
  const sortattuTaulukko = blogs.sort((a, b) => {
    const nameA = a.author.toUpperCase(); // ignore upper and lowercase
    const nameB = b.author.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  // eka hlö pois ja käsittelyn pohjaksi (eli maximi tässä vaiheessa)
  let maxAuthor = sortattuTaulukko[0].author;
  let maxLikes = sortattuTaulukko[0].likes;
  sortattuTaulukko.shift();

  for (let i = 0; i < sortattuTaulukko.length; i++) {
    if (maxAuthor === sortattuTaulukko[i].author) {
      maxLikes = maxLikes + sortattuTaulukko[i].likes;
      sortattuTaulukko.shift();
    }
  }

  // Jos taulukossa on vain yksi (rivi, tai kirjailija), niin palautetaan se...
  if (sortattuTaulukko.length === 0) {
    return { author: maxAuthor, likes: maxLikes };
  }

  //... muuten otetaan seuraava kirjailija käsittelyyn ja käydään kaikki loput läpi...
  let kasAuthor = sortattuTaulukko[0].author;
  let kasLikes = sortattuTaulukko[0].likes;
  sortattuTaulukko.shift();

  // saattaahan olla, että nyt tulikin jo maksimi käsittelyyn...
  if (kasLikes > maxLikes) {
    maxAuthor = kasAuthor;
    maxLikes = kasLikes;
  }

  for (let i = 0; i < sortattuTaulukko.length; i++) {
    // niin kauan kun on sama, niin kasvatetaan tykkäyksiä...
    if (kasAuthor === sortattuTaulukko[i].author) {
      kasLikes = kasLikes + sortattuTaulukko[i].likes;
      // ja, kun käsiteltävä vaihtuu, niin vaihdetaan...
    } else {
      kasAuthor = sortattuTaulukko[i].author;
      kasLikes = sortattuTaulukko[i].likes;
    }
    // Jospa on jo löytynyt maximi...
    if (kasLikes > maxLikes) {
      maxAuthor = kasAuthor;
      maxLikes = kasLikes;
    }
  }

  // tulipas tästä nyt monimutkainen... Jos aikaa, niin katsonpa uusiksi.
  // ... toisaalta tuntuu toimivan hyvin... :-) Noh, katsotaan...

  return { author: maxAuthor, likes: maxLikes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};

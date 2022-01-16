const { DateTime } = require("luxon");
const pluginRemark = require('@fec/eleventy-plugin-remark');
const pluginRss = require('@11ty/eleventy-plugin-rss'); 

module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    // Templates:
    "html",
    "njk",
    "md",
    // Static Assets:
    "css",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "woff",
    "woff2"
  ]);
  eleventyConfig.addPassthroughCopy("public");

  // Filters let you modify the content https://www.11ty.dev/docs/filters/
  eleventyConfig.addFilter("htmlDateString", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.setBrowserSyncConfig({ ghostMode: false });

  /* Build the collection of posts to list in the site
     - Read the Next Steps post to learn how to extend this
  */
  eleventyConfig.addCollection("posts", function(collection) {
    
    /* The posts collection includes all posts that list 'posts' in the front matter 'tags'
       - https://www.11ty.dev/docs/collections/
    */
    
    // EDIT HERE WITH THE CODE FROM THE NEXT STEPS PAGE TO REVERSE CHRONOLOGICAL ORDER
    // (inspired by https://github.com/11ty/eleventy/issues/898#issuecomment-581738415)
    const coll = collection
      .getFilteredByTag("posts");

    // From: https://github.com/11ty/eleventy/issues/529#issuecomment-568257426 
    // Adds {{ prevPost.url }} {{ prevPost.data.title }}, etc, to our njks templates
    for (let i = 0; i < coll.length; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return coll;
  });

  eleventyConfig.addPlugin(pluginRemark, {
    plugins: [
      'remark-gfm', // 增强语法支持GFM
      'remark-slug',
      {
        plugin: 'remark-toc', // 生成目录
        options: {
          heading: '目录',
          maxDepth: 4,
          ordered: true
        }
      }

    ],
  });
  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {}
  });

  eleventyConfig.addPlugin((eleventyConfig, options) => {
    const defaults = {
      wpm: 275,
      showEmoji: true,
      emoji: "🍿",
      label: "min. read",
      bucketSize: 5,
    };
  
    eleventyConfig.addFilter("emojiReadTime", (content) => {
      const { wpm, showEmoji, emoji, label, bucketSize } = {
        ...defaults,
        ...options,
      };
      const minutes = Math.ceil(content.trim().length / wpm);
      const buckets = Math.round(minutes / bucketSize) || 1;
  
      let displayLabel = `${minutes} ${label}`;

      if (showEmoji) {
        displayLabel = `${new Array(buckets || 1).fill(emoji).join("")}  ${displayLabel}`;
      }
  
      return displayLabel;
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
    }
  };
};

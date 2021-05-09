source "https://rubygems.org"

# Jekyll gem
gem "jekyll", "~> 4.2"

# Jekyll official plugins
group :jekyll_plugins do
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-feed", "~> 0.15"
  gem "jekyll-seo-tag", "~> 2.7"
end

# Default theme for jekyll
gem "minima", "~> 2.5"

# Webrick dependency for Ruby 3.0 
gem "webrick", "~> 1.7"

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 2.0"
  gem "tzinfo-data", "~> 1.2021"
end

# Performance-booster for watching directories on Windows
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "wdm", "~> 0.1"
end

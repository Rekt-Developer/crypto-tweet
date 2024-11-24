<template>
  <header class="container mt-8 text-center text-slate-800">
    <h1 class="mb-2 text-2xl font-bold lg:text-3xl">Crypto Tweets 🚀</h1>
    <h2 class="items-end flex-1 h-6 mb-4 leading-tight md:text-xl">
      Instantly Discover How Many People Are Tweeting About Your Favorite Cryptocurrency
    </h2>
    <p class="mb-4 text-sm text-pretty">
      In today's social media-driven world, monitoring cryptocurrency buzz is key. This tool provides real-time data on tweets and retweets
      for top cryptocurrencies. More chatter means higher chances of trending. Stay informed, gain an edge, and enhance your decision-making
      in this fast-paced market.
    </p>
  </header>
  <main class="container flex-1 text-slate-700">
    <div
      class="relative my-8 overflow-auto border-b rounded shadow bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-b-slate-300">
      <table class="w-full text-sm text-left border-collapse table-auto">
        <thead>
          <tr>
            <th
              class="p-4 pl-6 font-medium text-left text-white border-b cursor-pointer w-[32px]"
              :class="{ underline: rankOrder }"
              @click="toggleOrderByRank">
              <span>#</span>
            </th>
            <th class="p-4 pl-0 font-medium text-left text-white border-b cursor-pointer">Coin</th>
            <th
              class="p-4 font-medium text-right text-white border-b cursor-pointer"
              :class="{ underline: tweetOrder }"
              @click="toggleOrderByTweets">
              <span>Tweets</span>
            </th>
            <th
              class="p-4 font-medium text-right text-white border-b cursor-pointer"
              :class="{ underline: retweetOrder }"
              @click="toggleOrderByRetweets">
              Retweets
            </th>
            <th
              class="p-4 pr-8 font-medium text-right text-white border-b cursor-pointer"
              :class="{ underline: exposureOrder }"
              @click="toggleOrderByExposure">
              Exposure
            </th>
          </tr>
        </thead>
        <tbody class="bg-white" v-if="coins">
          <tr v-for="coin in coinList" :key="coin.id">
            <td class="px-4 py-2 pl-6 border-b border-slate-100">
              <span class="tabular-nums">{{ coin.cmc_rank }}.</span>
            </td>
            <td class="py-2 pr-4 text-left border-b border-slate-100">
              <div class="grid">
                <h3 class="leading-none md:text-lg">
                  <a
                    class="inline-flex items-center mr-1 font-semibold"
                    :href="`https://coinmarketcap.com/currencies/${coin.slug}`"
                    target="_blank"
                    rel="noopener noreferrer">
                    <img v-if="coin.id" :src="imageSrc(coin.id)" class="w-4 h-4 mr-2" :alt="coin.name" loading="lazy" />
                    <span>{{ coin.name }}</span>
                  </a>
                  <small class="text-xs">{{ coin.symbol }}</small>
                  <i
                    v-if="coin.tweets && coin.tweets.stats.color == 3 && coin.tweets.stats.retweets > 2000"
                    class="ml-1 text-xs text-red-500 fas fa-fire" />
                </h3>
                <CoinPrice :coin="coin.quote.USD" class="flex-1" />
              </div>
            </td>
            <td class="px-4 py-2 text-right border-b border-slate-100 text-slate-700 tabular-nums">
              <span v-if="coin.tweets">{{ readableNumber(coin.tweets.stats.tweets) }}</span>
              <LoadingIcon class="ml-auto" v-else />
            </td>
            <td class="px-4 py-2 text-right border-b border-slate-100 text-slate-700 tabular-nums">
              <span v-if="coin.tweets">{{ readableNumber(coin.tweets.stats.retweets) }}</span>
              <LoadingIcon class="ml-auto" v-else />
            </td>
            <td class="px-4 py-2 pr-8 text-right border-b border-slate-100 text-slate-700 tabular-nums">
              <span v-if="coin.tweets">{{ readableNumber(coin.tweets.stats.exposure) }}</span>
              <LoadingIcon class="ml-auto" v-else />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-end gap-2 my-8">
      <span>Number of Coins:</span>
      <select class="p-1 border border-gray-500" v-model="numberOfCoins">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </main>
  <MyFooter />
</template>

<script>
import LoadingIcon from './components/LoadingIcon.vue';
import MyFooter from './components/MyFooter.vue';
import CoinPrice from './components/CoinPrice.vue';
import axios from 'axios';

export default {
  data() {
    return {
      coins: null,
      numberOfCoins: 20,
      bitcoinTweets: null,
      retweetOrder: null,
      tweetOrder: null,
      rankOrder: 'desc',
    };
  },
  components: { LoadingIcon, MyFooter, CoinPrice },
  watch: {
    numberOfCoins(newValue) {
      this.coins = [];
      this.getCoins();
    },
  },
  mounted() {
    this.getCoins();
  },
  methods: {
    async getCoins() {
      const url = `/.netlify/functions/cmc?limit=${this.numberOfCoins}`;
      const res = await axios.get(url);
      console.log(res.data);

      this.coins = res.data.data || [];
      // loop through coins and get their tweets and add to coins
      this.coins.forEach(async (coin) => {
        const hashtag = coin.name.toLowerCase().replace(/ /g, '');
        const stats = await axios.get(`/.netlify/functions/ritekit?coin=${hashtag}`);
        coin.tweets = stats.data;
      });
    },
    toggleOrderByRank() {
      const order = this.rankOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        return order === 'desc' ? a.cmc_rank - b.cmc_rank : b.cmc_rank - a.cmc_rank;
      });
      this.rankOrder = order;
      this.tweetOrder = null;
      this.retweetOrder = null;
      this.exposureOrder = null;
    },
    toggleOrderByRetweets() {
      const order = this.retweetOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === 'desc' ? b.tweets.stats.retweets - a.tweets.stats.retweets : a.tweets.stats.retweets - b.tweets.stats.retweets;
        }
        return 0;
      });
      this.retweetOrder = order;
      this.tweetOrder = null;
      this.rankOrder = null;
      this.exposureOrder = null;
    },
    toggleOrderByTweets() {
      const order = this.tweetOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === 'desc' ? b.tweets.stats.tweets - a.tweets.stats.tweets : a.tweets.stats.tweets - b.tweets.stats.tweets;
        }
        return 0;
      });
      this.tweetOrder = order;
      this.retweetOrder = null;
      this.rankOrder = null;
      this.exposureOrder = null;
    },
    toggleOrderByExposure() {
      const order = this.exposureOrder === 'desc' ? 'asc' : 'desc';
      this.coins.sort((a, b) => {
        if (a.tweets && b.tweets) {
          return order === 'desc' ? b.tweets.stats.exposure - a.tweets.stats.exposure : a.tweets.stats.exposure - b.tweets.stats.exposure;
        }
        return 0;
      });
      this.exposureOrder = order;
      this.tweetOrder = null;
      this.retweetOrder = null;
      this.rankOrder = null;
    },
    readableNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    imageSrc(id) {
      return `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`;
    },
  },
  computed: {
    coinList() {
      return this.coins;
    },
  },
};
</script>

<style>
body {
  background-color: #f8fafc;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1024px;
  margin: 0 auto;
}

.container {
  margin-inline: auto;
}

.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.5s;
}

.scale-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

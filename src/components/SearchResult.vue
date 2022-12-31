<template>
    <h1>「{{ q }}」の検索結果:{{ totalCount }}件</h1>
    <div v-if="contents.length >= 1">
        <div class="post" v-for="post in contents">
            <template v-if="post.eyecatch">
                <a v-bind:href="`/posts/${post.id}`">
                    <img width="720" height="360" v-bind:src="post.eyecatch.url" alt="" />
                </a>
            </template>
            <span class="published_time_span">
                <time datetime="post.publishedAt">
                    {{new Date(post.publishedAt).toLocaleString('ja-JP')}}
                </time>
            </span>
            <template v-if="post.category">
                <span class="category">
                    <a v-bind:href="`/category/${post.category.id}`">
                        {{post.category.name}}
                    </a>
                </span>
            </template>
            <a v-bind:href="`/posts/${post.id}`">
                <h2>{{post.title}}</h2>
                <div class="description">
                    {{post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').length > 100 ? post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,101) + '...' : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')}}
                </div>
            </a>
        </div>
    </div>
    <div v-else>
        <p>検索結果はありませんでした</p>
    </div>
</template>

<script lang="ts">
import axios from 'axios'

export default {
    data() {
        return {
            contents: this.contents || [], // 検索結果の配列
            totalCount: this.totalCount || 0, // 検索結果件数の表示用
            q: new URLSearchParams(window.location.search).get("q"), // SearchForm.vueから渡されるクエリ
            searchable: true, // この画面から検索した際の制御
        };
    },

    async created() {
        const query = new URLSearchParams(window.location.search);
        if (query.get("q") === undefined) {
            return;
        }
        // 検索可能ならsearchメソッド実行
        this.search(query.get("q"));
    },
    methods: {
        setSearchable(): void {
            this.searchable = true;
        },
        async search(q = ''): Promise<void> {
            if (!q.trim() || !this.searchable) {
                return;
            }

            const { data, error } = await axios
            // search.jsにクエリを渡して呼び出す
            .get(`/api/search?q=${q}`)
            .catch((error) => ({
                error
            }));
            if (error) {
                return;
            }
            this.q = q;
            this.contents = data.contents;
            this.totalCount = data.totalCount;
            this.searchable = false;
        },
    },
}
</script>
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener("fetch", (event) => {
    try {
        event.respondWith(handleEvent(event))
    } catch (e) {
        event.respondWith(new Response('Internal Error', { status: 500 }))
    }
})

async function handleEvent(event) {
    try {
        let options = {}
        let response = await getAssetFromKV(event, options)
        return response
    } catch (e) {
        return new Response(e.message || e.toString(), { status: 500 })
    }
}

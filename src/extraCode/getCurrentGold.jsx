
    useEffect(() => {

        let result = axios.get('https://bcast.aaravbullion.in/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/aarav?_=1774345065305').then(async (res) => {

            const result = res.data
                .trim()
                .split("\n")
                .map(line => {
                    const parts = line.split("\t").filter(Boolean);

                    return {
                        id: Number(parts[0]),
                        name: parts[1].trim(),
                        price1: Number(parts[2]),
                        price2: Number(parts[3]),
                        price3: Number(parts[4]),
                        price4: Number(parts[5]),
                    };
                });
        })
    }, [])
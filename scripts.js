// how do we cache an api key?
var api_key = "key";
var channel_key = "UCtoaZpBnrd0lhycxYJ4MNOQ";
var urlRoot = "https://www.googleapis.com/youtube/v3/";

function setAPIKey() {        
    var input = document.getElementById("key-input");
    var div_key = document.getElementById("div-key");
    var label_key = document.getElementById("key-label");
    label_key.innerHTML = "Channel Id";
    api_key = input.value;
}

function buttonUpdate() {
    var changeLabel = document.getElementById("test-label");
    changeLabel.innerHTML = api_key;
}

function httpTest() {
    var test_label = document.getElementById("test-label");
    const url = 'https://jsonplaceholder.typicode.com/post';

    fetch(url)
        .then(data => {return data.json()})
        .then(res => {test_label.innerHTML = res});
}

function generateFile() {
    getAllVideos(getVideoDetails);
    

    // for(i=0; i < details.length; i++) {
    //     console.log(details[i].items[i].statistics.viewCount);
    // }
}

// So you dont use it like this:

// var returnValue = myFunction(query);

// But like this:

// myFunction(query, function(returnValue) {
//   // use the return value here instead of like a regular (non-evented) return value
// });

function process(details) {
    console.log(details[0].items[0].statistics.viewCount);
    var rows = [];
    rows.push(["Video Id", "Title", "Description", "Tags", "Date Published", "Thumbnail URL", 
        "Video Length", "View Count", "Like Count", "Dislike Count", "Favourite Count", "Comment Count",]);

    // create rows first
    for (i = 0; i < details.length; i++) {
        for (j = 0; j < details[i].items.length; j++) {
            var currentItem = details[i].items[j];
            var row = []
            
            row.push(currentItem.id);
            row.push(currentItem.snippet.title.replace(",","").replace("\"",""));
            row.push(currentItem.snippet.description.replace("#","").replace(",","").replace("\n",""));
            row.push(currentItem.snippet.tags);
            row.push(currentItem.snippet.publishedAt);
            row.push(currentItem.snippet.thumbnails.maxres.url);
            row.push(currentItem.contentDetails.duration);
            row.push(currentItem.statistics.viewCount);
            row.push(currentItem.statistics.likeCount);
            row.push(currentItem.statistics.dislikeCount);
            row.push(currentItem.statistics.favoriteCount);
            row.push(currentItem.statistics.commentCount);
            rows.push(row);

            // vdi.Id,
            // vdi.Snippet.Title.Contains(",") ? "\"" + vdi.Snippet.Title.Replace("\"", string.Empty) + "\"" : vdi.Snippet.Title.Replace("\"", string.Empty),
            // vdi.Snippet.Tags != null ? string.Join(";", vdi.Snippet.Tags) : string.Empty,
            // "\"" + vdi.Snippet.Description.Replace("\"", string.Empty) + "\"",
            // vdi.Snippet.PublishedAt.ToLongDateString(),
            // vdi.Snippet.Thumbnails.Maxres?.Url,
            // vdi.ContentDetails.Duration,
            // "???",
            // vdi.Statistics.ViewCount.ToString(),
            // vdi.Statistics.CommentCount.ToString(),
            // vdi.Statistics.LikeCount.ToString(),
            // vdi.Statistics.DislikeCount.ToString()
        }
    }
    // write csv
    let csvContent = "data:text/csv;charset=utf-8,";
    
    rows.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });

    // var encodedUri = encodeURI(csvContent);
    // window.open(encodedUri);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".

}

// private void WriteToFile(List<VideoDetail> details, string fileLocation)
// {
//     List<string> fileLines = new List<string>();
//     fileLines.Add("Video Id, Title, Tags, Description, Date Published, Thumbnail URL, Video Length, Watch Url,"
//         + "View Count, Comment Count, Like Count, Dislike Count");

//     foreach (VideoDetail vd in details)
//     {
//         foreach (VideoDetailItem vdi in vd.Items)
//         {
//             string[] columns =
//             {
//                 vdi.Id,
//                 vdi.Snippet.Title.Contains(",") ? "\"" + vdi.Snippet.Title.Replace("\"", string.Empty) + "\"" : vdi.Snippet.Title.Replace("\"", string.Empty),
//                 vdi.Snippet.Tags != null ? string.Join(";", vdi.Snippet.Tags) : string.Empty,
//                 "\"" + vdi.Snippet.Description.Replace("\"", string.Empty) + "\"",
//                 vdi.Snippet.PublishedAt.ToLongDateString(),
//                 vdi.Snippet.Thumbnails.Maxres?.Url,
//                 vdi.ContentDetails.Duration,
//                 "???",
//                 vdi.Statistics.ViewCount.ToString(),
//                 vdi.Statistics.CommentCount.ToString(),
//                 vdi.Statistics.LikeCount.ToString(),
//                 vdi.Statistics.DislikeCount.ToString()
//             };
//             fileLines.Add(string.Join(",", columns));
//         } 
//     }

//     // write to file
//     System.IO.File.WriteAllLines(fileLocation, fileLines);
//     System.Diagnostics.Process.Start(fileLocation);
// }


async function getVideoDetails(videoIds, callback) {
    var response;
    var details = [];

    for(i = 0; i < videoIds.length; i+=20) {
    //for(i = 0; i < 1; i++) {
        var url =
            urlRoot
            + "videos?"
            + "&part=snippet,statistics,contentDetails"
            + "&key=" + api_key
            + "&id=";
        for (j = 0; j < 20 && j < videoIds.length - i; j++) {
            url += videoIds[j] + ",";
        }
        await fetch(url)
            .then(data => {return data.json()})
            .then(res => {response = res});

        details.push(response)
    }

    callback(details);
}

async function getAllVideos(callback) {
    var allVideoIds = [];
    var data = null;

    var url =
        urlRoot
        + "search?"
        + "channelId=" + channel_key
        + "&maxResults=50"
        + "&order=date"
        + "&type=video"
        + "&key=" + api_key;

    await fetch(url)
        .then(response => response.json())
        .then(res => {data = res});

    for(i = 0; i < data.items.length; i++) {
        allVideoIds.push(data.items[i].id.videoId);
    }

    // while (response.nextPageToken != null) {
    //     fetch(url + "&pageToken=" + responseObject.NextPageToken)
    //         .then(data => {return data.json()})
    //         .then(res => {response = res});

    //     for(i=0; i < response.items.length; i++) {
    //         allVideoIds.push(response.items[i].id.videoId);
    //     }
    // }

    callback(allVideoIds, process);
}

//https://www.googleapis.com/youtube/v3/search?channelId=UCtoaZpBnrd0lhycxYJ4MNOQ&maxResults=50&order=date&type=video&key=AIzaSyBF51v6ZY98M1dGU4KFzt7vzprBr-NGgOE

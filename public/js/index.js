$(function() {
    function init() {
        getFileInfo(function(res) {
            render(res);
        });
        initEvt();
    };

    function initEvt() {
        $('#pass_id').on('click', function() {
            sendReview('pass');
        });
        $('#not_pass_id').on('click', function() {
            sendReview('porn');
        });
        $('#pic_container_id').on('click', function(evt) {
            var target = $(evt.target);
            var role = target.attr('data-role');
            if (role == 'img') {
                playVideo(target.attr('data-start'));
            }
        });
    };

    function playVideo(startTime) {
        var video = $('#video_id');
        var videoObj = video[0];
        videoObj.currentTime = startTime ? startTime : 0;
        videoObj.play();
    }

    function sendReview(type) {
        $.ajax({
            url: '/review',
            data: {
                review_status: type,
                task_id: ReviewData.taskId,
                file_id: ReviewData.fileId,
                reviewer_id: 'admin01'
            },
            type: 'POST',
            success: function(res) {
                var code = res.code;
                if (code == 200) {
                    alert('任务成功');
                    getFileInfo(function(data) {
                        render(data);
                    });
                } else if (code == 624) {
                    alert('任务失效');
                } else {
                    alert('接口异常，请稍等重试[' + code + ']');
                }
            },
            error: function() {
                alert('接口异常');
            }
        });
    };

    var ReviewData = {
        taskId: '',
        fileId: ''
    };

    function getFileInfo(callback) {
        $.ajax({
            url: '/review/get_next_file',
            data: {
                reviewer_id: 'admin01'
            },
            type: 'POST',
            success: function(res) {
                var code = res.code;
                if (code == 200) {
                    callback(res);
                } else if (code == 623) {
                    alert('没有任务了');
                } else {
                    alert('接口异常，请稍等重试[' + code + ']');
                }
            },
            error: function() {
                alert('接口异常');
            }
        });
    };

    function render(res) {
        var data = res.data;
        ReviewData.taskId = escapeHTML(data.taskId);
        ReviewData.fileId = escapeHTML(data.fileData.fileId);
        $('#file_id').text(escapeHTML(data.fileData.fileId));
        $('#file_name').text(escapeHTML(data.fileData.title));
        $('#video_id').attr('src', escapeHTML(data.fileData.url));
        var picStr = '';
        for (var i = 0; i < data.contentReviewList.length; i++) {
            var item = data.contentReviewList[i];
            if (item.taskType.toLowerCase() == 'porn') {
                for (var j = 0; j < item.output.segments.length; j++) {
                    var segmentItem = item.output.segments[j];
                    if (segmentItem.confidence >= 70) {
                        picStr += '<div class="pic red"><img data-role="img" src="' + escapeHTML(segmentItem.url) + '" data-start="' + escapeHTML(segmentItem.startTimeOffset) + '" /></div>'
                    } else {
                        picStr += '<div class="pic"><img data-role="img" src="' + escapeHTML(segmentItem.url) + '" data-start="' + escapeHTML(segmentItem.startTimeOffset) + '" /></div>'
                    }
                }
                break;
            }
        }
        $('#pic_container_id').html($(picStr));
    };

    function escapeHTML(str) {
        if (typeof str != 'string') {
            return '' + str;
        }
        return str.replace(/[<>&"']/g, function($0) {
            switch ($0) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case '"':
                    return '&quot;';
                case '\'':
                    return '&#39;';
            }
        });
    }

    init();
});
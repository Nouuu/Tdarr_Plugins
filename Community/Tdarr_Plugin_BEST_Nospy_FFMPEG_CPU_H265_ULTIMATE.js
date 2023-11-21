/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = () => ({
  id: 'Tdarr_Plugin_BEST_Nospy_FFMPEG_CPU_H265_ULTIMATE',
  Stage: 'Pre-processing',
  Name: 'Nospy-Transcode H265 Using CPU & FFMPEG, Ultimate Settings',
  Type: 'Video',
  Operation: 'Transcode',
  Description: `Files not in H265 will be transcode into H265 using CPU with ffmpeg.
                Settings are dependant on file bitrate
                Working by the logic that H265 can support the same amount of data at half the bitrate of H264.
                This plugin will adapt bitrate settings based on original bitrate and resolution.
                This plugin will skip any files that are in the VP9 codec.`,
  Version: '0.1',
  Tags: 'pre-processing,ffmpeg,video only,configurable,h265',
  Inputs: [
    {
      name: 'anime',
      type: 'boolean',
      defaultValue: false,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if file is anime.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
    {
      name: 'container',
      type: 'string',
      defaultValue: 'mkv',
      inputUI: {
        type: 'dropdown',
        options: [
          'mkv',
          'mp4',
          'original',
        ],
      },
      tooltip: `Specify output container of file. Use 'original' without quotes to keep original container.
                  \\n Ensure that all stream types you may have are supported by your chosen container.
                  \\n mkv is recommended.`
      ,
    },
    {
      name: 'handle_hd',
      type: 'boolean',
      defaultValue: true,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if HD content should be handled.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
    {
      name: 'hd_bitrate_cutoff',
      type: 'number',
      defaultValue: 1800,
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the bitrate cutoff for HD content.
                    \\nExample:\\n
                    1800
                    
                    \\nExample:\\n
                    2500`,
    },
    {
      name: 'handle_fhd',
      type: 'boolean',
      defaultValue: true,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if FHD content should be handled.
                    \\nExample:\\n
                    true
                    
                    \\nExample:\\n
                    false`,
    },
    {
      name: 'fhd_bitrate_cutoff',
      type: 'number',
      defaultValue: 2500,
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the bitrate cutoff for FHD content.
                    \\nExample:\\n
                    2500
                    
                    \\nExample:\\n
                    3500`,
    },
    {
      name: 'handle_uhd',
      type: 'boolean',
      defaultValue: false,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Specify if UHD content should be handled.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
    {
      name: 'uhd_bitrate_cutoff',
      type: 'number',
      defaultValue: 6000,
      inputUI: {
        type: 'text',
      },
      tooltip: `Specify the bitrate cutoff for UHD content.
                    \\nExample:\\n
                    6000
                    
                    \\nExample:\\n
                    8000`,
    },
    {
      name: 'force_conform',
      type: 'boolean',
      defaultValue: false,
      inputUI: {
        type: 'dropdown',
        options: [
          'false',
          'true',
        ],
      },
      tooltip: `Make the file conform to output containers requirements.
                \\n Drop hdmv_pgs_subtitle/eia_608/subrip/timed_id3 for MP4.
                \\n Drop data streams/mov_text/eia_608/timed_id3 for MKV.
                \\n Default is false.
                    \\nExample:\\n
                    true

                    \\nExample:\\n
                    false`,
    },
  ],
});

// Bitrate settings maps
const bitrateSettingsMap = {
  general: {
    '720p': [
      {
        cutoff: 1200, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
      },
      {
        cutoff: 1800, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
      {
        cutoff: 2400, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
    ],
    '1080p': [
      {
        cutoff: 2500, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
      },
      {
        cutoff: 3500, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
      {
        cutoff: 4500, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
    ],
    '4k': [
      {
        cutoff: 6000, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
      },
      {
        cutoff: 9000, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
      {
        cutoff: 12000, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
    ],
  },
  anime: {
    '720p': [
      {
        cutoff: 1000, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
      },
      {
        cutoff: 1500, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
      {
        cutoff: 2000, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
    ],
    '1080p': [
      {
        cutoff: 1800, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
      },
      {
        cutoff: 2800, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
      {
        cutoff: 4000, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
    ],
    '4k': [
      {
        cutoff: 5000, multiplier: 0.6, minPercentage: 70, maxPercentage: 130, preset: 'slow',
      },
      {
        cutoff: 9000, multiplier: 0.55, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
      {
        cutoff: 12000, multiplier: 0.5, minPercentage: 70, maxPercentage: 130, preset: 'medium',
      },
    ],
  },
};

const calculateBitrateSettings = (resolution, currentBitrate, isAnime) => {
  const settingsMap = isAnime ? bitrateSettingsMap.anime : bitrateSettingsMap.general;
  const settings = settingsMap[resolution].find((setting) => currentBitrate > setting.cutoff);

  if (!settings) return null; // Return null if no settings match

  const targetBitrate = Math.round(currentBitrate * settings.multiplier);
  const minimumBitrate = Math.round(targetBitrate * (settings.minPercentage / 100));
  const maximumBitrate = Math.round(targetBitrate * (settings.maxPercentage / 100));
  const { preset } = settings;

  return {
    targetBitrate, minimumBitrate, maximumBitrate, preset,
  };
};

const conformStreams = (file, container) => {
  const subtitleCodecsMkv = ['mov_text', 'eia_608', 'timed_id3'];
  const subtitleCodecsMp4 = ['hdmv_pgs_subtitle', 'eia_608', 'subrip', 'timed_id3'];
  let extraArguments = '';

  if (container === 'mkv') {
    // Remove data from streams
    extraArguments += '-map -0:d ';
    file.ffProbeData.streams.forEach((stream, index) => {
      try {
        if (subtitleCodecsMkv.includes(stream.codec_name.toLowerCase())) {
          // Remove unwanted subtitle streams
          extraArguments += `-map -0:${index} `;
        }
      } catch (err) {
        // Handle error
      }
    });
  } else if (container === 'mp4') {
    file.ffProbeData.streams.forEach((stream, index) => {
      try {
        if (subtitleCodecsMp4.includes(stream.codec_name.toLowerCase())) {
          // Remove unwanted subtitle streams
          extraArguments += `-map -0:${index} `;
        }
      } catch (err) {
        // Handle error
      }
    });
  }
  return extraArguments;
};

const handleVideo = (file, resolution, handleFlag, bitrateCutoff, isAnime) => {
  const response = { processFile: false, infoLog: '' };
  response.infoLog += `${resolution} video detected. \n`;
  if (!handleFlag) {
    response.infoLog += `${resolution} handling disabled. \n`;
    return response;
  }
  let currentBitrate = file.ffProbeData.streams[0].bit_rate;
  if (Number.isNaN(currentBitrate) || !currentBitrate || currentBitrate === 0) {
    response.infoLog += 'Cannot read video stream bitrate. Using file bitrate. \n';
    currentBitrate = file.ffProbeData.format.bit_rate;
  }
  currentBitrate = Math.round(currentBitrate / 1000);
  response.currentBitrate = currentBitrate;
  response.infoLog += `Current video bitrate = ${currentBitrate} \n`;
  if (currentBitrate <= bitrateCutoff) {
    response.infoLog += `Bitrate is below ${bitrateCutoff} (${currentBitrate}). \n`;
    return response;
  }
  const bitrateSettings = calculateBitrateSettings(resolution, currentBitrate, isAnime);
  if (!bitrateSettings) {
    response.infoLog
      += `Current bitrate (${currentBitrate}) is below cutoff or unsupported resolution. Skipping transcoding.\n`;
    return response;
  }

  response.processFile = true;
  response.bitrateSettings = bitrateSettings;
  return response;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  const lib = require('../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  inputs = lib.loadDefaultValues(inputs, details);
  const response = {
    processFile: false,
    preset: '',
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: true,
    infoLog: '',
  };

  const resolutions = {
    r480p: '480p',
    r576p: '576p',
    r720p: '720p',
    r1080p: '1080p',
    r4KUHD: '4k',
    rDCI4K: '4k',
    rOther: 'Other',
  };

  const handleFlags = {
    handle_hd: inputs.handle_hd,
    handle_fhd: inputs.handle_fhd,
    handle_uhd: inputs.handle_uhd,
  };

  const bitrateCutoffs = {
    handle_hd: inputs.hd_bitrate_cutoff,
    handle_fhd: inputs.fhd_bitrate_cutoff,
    handle_uhd: inputs.uhd_bitrate_cutoff,
  };

  // Check if inputs.container has been configured. If it hasn't then exit plugin.
  if (inputs.container === '') {
    response.infoLog += 'Plugin has not been configured, please configure required options. Skipping this plugin. \n';
    response.processFile = false;
    return response;
  }

  if (inputs.container === 'original') {
    // eslint-disable-next-line no-param-reassign
    inputs.container = `${file.container}`;
  }
  response.container = `.${inputs.container}`;

  // Check if file is a video and has a codec and resolution.
  if (file.fileMedium !== 'video') {
    response.processFile = false;
    response.infoLog += 'File is not a video. \n';
    return response;
  }

  if (!file.ffProbeData.streams[0].codec_name) {
    response.processFile = false;
    response.infoLog += 'Cannot read codec name. \n';
    return response;
  }

  if (!file.video_resolution) {
    response.processFile = false;
    response.infoLog += 'Cannot read video resolution. \n';
    return response;
  }

  const videoResolution = file.video_resolution;
  const codecName = file.ffProbeData.streams[0].codec_name.toLowerCase();

  if ([resolutions.r480p, resolutions.r576p, resolutions.rOther].includes(videoResolution)) {
    // We have a SD video, abort.
    response.infoLog += 'SD video detected. \n';
    response.processFile = false;
    return response;
  }

  let resolutionSettings = null;

  switch (videoResolution) {
    case resolutions.r720p:
      resolutionSettings = handleVideo(
        file,
        '720p',
        handleFlags.handle_hd,
        bitrateCutoffs.handle_hd,
        inputs.anime,
      );
      break;
    case resolutions.r1080p:
      resolutionSettings = handleVideo(
        file,
        '1080p',
        handleFlags.handle_fhd,
        bitrateCutoffs.handle_fhd,
        inputs.anime,
      );
      break;
    case resolutions.r4KUHD:
    case resolutions.rDCI4K:
      resolutionSettings = handleVideo(
        file,
        '4k',
        handleFlags.handle_uhd,
        bitrateCutoffs.handle_uhd,
        inputs.anime,
      );
      break;
    default:
      response.infoLog += 'Unknown video resolution detected. \n';
      response.processFile = false;
      return response;
  }

  if (resolutionSettings && !resolutionSettings.processFile) {
    response.infoLog += resolutionSettings.infoLog;
    response.processFile = false;
    return response;
  }

  // Set up required variables.
  let extraArguments = '';
  // Apply calculated bitrate settings.
  const { currentBitrate } = resolutionSettings;
  const { targetBitrate } = resolutionSettings.bitrateSettings;
  // Allow some leeway under and over the targetBitrate.
  const { minimumBitrate } = resolutionSettings.bitrateSettings;
  const { maximumBitrate } = resolutionSettings.bitrateSettings;
  const { preset } = resolutionSettings.bitrateSettings;

  // If targetBitrate comes out as 0 then something has gone wrong and bitrates could not be calculcated.
  // Cancel plugin completely.
  if (targetBitrate === 0) {
    response.processFile = false;
    response.infoLog += 'Target bitrate could not be calculated. Skipping this plugin. \n';
    return response;
  }

  // Check if force_conform option is checked.
  // If so then check streams and add any extra parameters required to make file conform with output format.
  if (inputs.force_conform === true) {
    extraArguments += conformStreams(file, inputs.container.toLowerCase());
  }

  // Check if codec of stream is hevc or vp9
  // AND file.container matches inputs.container.
  // If so then skip file.
  if ((codecName === 'hevc' || codecName === 'vp9') && file.container === `${inputs.container}`) {
    response.processFile = false;
    response.infoLog += `File is already hevc or vp9 & in ${inputs.container}. \n`;
    return response;
  }
  // Check if codec of stream is hevc or vp9
  // AND check if file.container does NOT match inputs.container.
  // If so remux file.
  if ((codecName === 'hevc' || codecName === 'vp9') && file.container !== `${inputs.container}`) {
    response.infoLog += `File is hevc or vp9 but is not in ${inputs.container} container. Remuxing. \n`;
    response.preset = `, -map 0 -c copy ${extraArguments}`;
    response.processFile = true;
    return response;
  }

  // Set bitrateSettings variable using bitrate information calulcated earlier.
  const bitrateSettings = `-b:v ${targetBitrate}k -minrate ${minimumBitrate}k `
    + `-maxrate ${maximumBitrate}k -bufsize ${currentBitrate}k`;
  // Print to infoLog information around file & bitrate settings.
  response.infoLog += `Container for output selected as ${inputs.container}. \n`;
  response.infoLog += `Current bitrate = ${currentBitrate} \n`;
  response.infoLog += 'Bitrate settings: \n';
  response.infoLog += `Target = ${targetBitrate} \n`;
  response.infoLog += `Minimum = ${minimumBitrate} \n`;
  response.infoLog += `Maximum = ${maximumBitrate} \n`;
  response.infoLog += `Buffer = ${currentBitrate} \n`;
  response.infoLog += `Preset = ${preset} \n`;

  response.preset += `,-map 0 -c:v libx265 ${bitrateSettings} `
    + `-c:a copy -c:s copy -max_muxing_queue_size 9999 ${extraArguments} -preset ${preset} `;
  response.processFile = true;
  response.infoLog += 'File is not hevc or vp9. Transcoding. \n';
  return response;
};

module.exports.details = details;
module.exports.plugin = plugin;
